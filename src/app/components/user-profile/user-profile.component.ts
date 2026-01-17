import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, user, User, updateProfile } from '@angular/fire/auth';
import { LibraryService } from '../../services/library/library.service';
import { ShareService } from '../../services/share/share.service';

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
    shares: number;
  };
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
  activeTab: 'settings' = 'settings';

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
      shares: 0,
    },
  };

  editForm = { name: '', bio: '' };

  constructor(private auth: Auth, public router: Router, private libraryService: LibraryService, private shareService: ShareService) {}

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
          shares: 0,
        },
      };

      this.editForm.name = this.userProfile.name;
      this.editForm.bio = this.userProfile.bio;

      this.loadStats();
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

  switchTab(tab: 'settings') {
    this.activeTab = tab;
  }

  loadStats() {
    // Load books read
    this.libraryService.getFinishedBooks().subscribe({
      next: (books) => {
        this.userProfile.stats.booksRead = books.length;
      },
      error: (error) => console.error('Erreur chargement livres lus:', error)
    });

    this.libraryService.getReadingBooks().subscribe({
      next: (books) => {
        this.userProfile.stats.currentlyReading = books.length;
      },
      error: (error) => console.error('Erreur chargement livres en cours:', error)
    });

    // Load shares
    this.shareService.getSharedBooksCount().subscribe({
      next: (count) => {
        this.userProfile.stats.shares = count;
      },
      error: (error) => console.error('Erreur chargement partages:', error)
    });
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