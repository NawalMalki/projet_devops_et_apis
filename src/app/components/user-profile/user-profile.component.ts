import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, user, User, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from '../../AuthService/auth.service';

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
    reviews: number;
  };
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
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
      reviews: 0
    }
  };

  editForm = {
    name: '',
    bio: ''
  };

  isEditMode = false;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  activeTab = 'activity';

  private userSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Vérifier l'authentification
    this.authService.checkAuthAndRedirect();

    // Écouter les changements d'utilisateur
    this.userSubscription = user(this.auth).subscribe(async (currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
        await this.loadUserProfile(currentUser);
      } else {
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadUserProfile(currentUser: User) {
    try {
      // Charger les données de base de Firebase Auth
      this.userProfile = {
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur',
        email: currentUser.email || '',
        avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=1a1a1a&color=fff&size=200`,
        bio: '',
        joinDate: this.formatJoinDate(currentUser.metadata.creationTime),
        stats: {
          booksRead: 0,
          currentlyReading: 0,
          favorites: 0,
          reviews: 0
        }
      };

      // Charger les données supplémentaires depuis Firestore (bio)
      const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.userProfile.bio = userData['bio'] || '';
      }

      // ✅ CALCULER LES VRAIES STATISTIQUES depuis les collections
      await this.calculateStats(currentUser.uid);

      this.loading = false;
      console.log('✅ Profil utilisateur chargé:', this.userProfile);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      this.errorMessage = 'Erreur lors du chargement du profil';
      this.loading = false;
    }
  }

  
  async calculateStats(userId: string) {
  try {
    // Compter les livres terminés
    const terminésRef = collection(this.firestore, 'termines');
    const terminésQuery = query(terminésRef, where('userId', '==', userId));
    const terminésSnapshot = await getDocs(terminésQuery);
    this.userProfile.stats.booksRead = terminésSnapshot.size;

    // Compter les livres en cours
    const enCoursRef = collection(this.firestore, 'en_cours_de_lecture');
    const enCoursQuery = query(enCoursRef, where('userId', '==', userId));
    const enCoursSnapshot = await getDocs(enCoursQuery);
    this.userProfile.stats.currentlyReading = enCoursSnapshot.size;

    // Compter les favoris
    const favorisRef = collection(this.firestore, 'favoris');
    const favorisQuery = query(favorisRef, where('userId', '==', userId));
    const favorisSnapshot = await getDocs(favorisQuery);
    this.userProfile.stats.favorites = favorisSnapshot.size;

    console.log('✅ Statistiques calculées:', this.userProfile.stats);
  } catch (error) {
    console.error('❌ Erreur lors du calcul des stats:', error);
  }
}

  formatJoinDate(dateString?: string): string {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      // Pré-remplir le formulaire avec les données actuelles
      this.editForm.name = this.userProfile.name;
      this.editForm.bio = this.userProfile.bio;
    }
    this.clearMessages();
  }

  cancelEdit() {
    this.isEditMode = false;
    this.clearMessages();
  }

  async saveProfile() {
    if (!this.currentUser) {
      this.errorMessage = 'Aucun utilisateur connecté';
      return;
    }

    this.saving = true;
    this.clearMessages();

    try {
      // Mettre à jour le displayName dans Firebase Auth
      if (this.editForm.name !== this.userProfile.name) {
        await updateProfile(this.currentUser, {
          displayName: this.editForm.name
        });
      }

      // Sauvegarder les données supplémentaires dans Firestore
      const userDocRef = doc(this.firestore, `users/${this.currentUser.uid}`);
      await setDoc(userDocRef, {
        bio: this.editForm.bio,
        updatedAt: new Date()
      }, { merge: true });

      // Mettre à jour l'affichage
      this.userProfile.name = this.editForm.name;
      this.userProfile.bio = this.editForm.bio;

      this.successMessage = '✅ Profil mis à jour avec succès !';
      this.isEditMode = false;

      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

      console.log('✅ Profil sauvegardé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      this.errorMessage = 'Erreur lors de la sauvegarde du profil';
    } finally {
      this.saving = false;
    }
  }

  onAvatarChange() {
    // TODO: Implémenter le téléchargement d'avatar
    alert('Fonctionnalité de changement d\'avatar à venir !');
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
  }

  onDeleteAccount() {
    const confirmation = confirm(
      '⚠️ Êtes-vous sûr de vouloir supprimer votre compte ?\n\n' +
      'Cette action est irréversible et supprimera toutes vos données.'
    );

    if (confirmation) {
      // TODO: Implémenter la suppression du compte
      alert('Fonctionnalité de suppression de compte à venir !');
    }
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}