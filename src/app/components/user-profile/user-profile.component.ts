import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, user, User, updateProfile } from '@angular/fire/auth';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinDate: string;
  stats: {
    booksRead: number;
    currentlyReading: number;
    favorites: number;
  };
}

interface FavoriteBook {
  id: string;
  title: string;
  author: string;
  cover: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  saving = false;
  isEditMode = false;
  activeTab: 'favorites' | 'settings' = 'favorites';

  userProfile: UserProfile = {
    name: '',
    email: '',
    avatar: '',
    bio: '',
    joinDate: '',
    stats: {
      booksRead: 0,
      currentlyReading: 0,
      favorites: 0,
    },
  };

  editForm = { name: '', bio: '' };

  favoriteBooks: FavoriteBook[] = [];
  loadingFavorites = false;

  constructor(private auth: Auth, public router: Router) {}

  ngOnInit() {
    user(this.auth).subscribe((u) => {
      this.currentUser = u;

      if (!u) {
        this.loading = false;
        return;
      }

      this.userProfile = {
        name: u.displayName || 'Utilisateur',
        email: u.email || '',
        avatar:
          u.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            u.displayName || 'User'
          )}&background=1a1a1a&color=fff`,
        bio: 'Amoureux des livres',
        joinDate: this.formatJoinDate(u.metadata.creationTime),
        stats: {
          booksRead: 0,
          currentlyReading: 0,
          favorites: 0,
        },
      };

      this.editForm.name = this.userProfile.name;
      this.editForm.bio = this.userProfile.bio;

      this.loadFavorites();
      this.loading = false;
    });
  }

  private formatJoinDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }

  toggleEditMode() {
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editForm.name = this.userProfile.name;
    this.editForm.bio = this.userProfile.bio;
  }

  async saveProfile() {
    if (!this.currentUser) return;
    this.saving = true;

    try {
      await updateProfile(this.currentUser, {
        displayName: this.editForm.name,
      });

      this.userProfile.name = this.editForm.name;
      this.userProfile.bio = this.editForm.bio;

      this.isEditMode = false;
      alert('✅ Profil mis à jour'); // JS alert pour succès
    } catch (e) {
      alert('❌ Erreur lors de la sauvegarde'); // JS alert pour erreur
    } finally {
      this.saving = false;
    }
  }

  switchTab(tab: 'favorites' | 'settings') {
    this.activeTab = tab;
    if (tab === 'favorites') this.loadFavorites();
  }

  loadFavorites() {
    this.loadingFavorites = true;

    setTimeout(() => {
      this.favoriteBooks = [
        {
          id: '1',
          title: 'Le Petit Prince',
          author: 'Antoine de Saint-Exupéry',
          cover: 'https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg',
        },
      ];

      this.userProfile.stats.favorites = this.favoriteBooks.length;
      this.loadingFavorites = false;
    }, 500);
  }

  onBookClick(book: FavoriteBook) {
    this.router.navigate(['/book', book.id]);
  }

  async onDeleteAccount() {
    if (!this.currentUser) return;
    const ok = confirm('Supprimer définitivement votre compte ?');
    if (!ok) return;

    try {
      await this.currentUser.delete();
      alert('✅ Compte supprimé avec succès'); // JS alert pour succès
      this.router.navigate(['/sign-in']);
    } catch {
      alert('❌ Reconnectez-vous pour supprimer le compte.'); // JS alert pour erreur
    }
  }
}
