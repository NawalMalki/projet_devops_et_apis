// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Auth } from '@angular/fire/auth';
// import { UserService } from '../../services/user/user.service';
// import { FollowService } from '../../services/follow/follow.service';
// import { SidebarComponent } from "../sidebar/sidebar.component";
// import { HeaderComponent } from "../header/header.component";

// @Component({
//   selector: 'app-discover-users',
//   standalone: true,
//   imports: [CommonModule, SidebarComponent, HeaderComponent],
//   templateUrl: './discover-users.component.html',
//   styleUrls: ['./discover-users.component.css']
// })
// export class DiscoverUsersComponent implements OnInit {
  
//   users: any[] = [];
//   currentUserId!: string;
//   sidebarOpen: boolean = true;
//   isLoading: boolean = true;

//   constructor(
//     private userService: UserService,
//     private followService: FollowService,
//     private auth: Auth
//   ) {}

//   ngOnInit() {
//     this.currentUserId = this.auth.currentUser!.uid;
    
//     // Simulation d'un délai de chargement pour montrer le spinner
//     this.isLoading = true;

//     this.userService.getAllUsers().subscribe({
//       next: (users) => {
//         this.users = users.filter(u => u.uid !== this.currentUserId);
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Erreur lors du chargement des utilisateurs:', error);
//         this.isLoading = false;
//       }
//     });
//   }

//   toggleSidebar() {
//     this.sidebarOpen = !this.sidebarOpen;
//   }

//   async follow(userId: string) {
//     try {
//       await this.followService.follow(this.currentUserId, userId);
//       // Optionnel: Mettre à jour l'interface utilisateur après le suivi
//       const user = this.users.find(u => u.uid === userId);
//       if (user) {
//         user.isFollowing = true;
//       }
//     } catch (error) {
//       console.error('Erreur lors du suivi:', error);
//       // Optionnel: Afficher un message d'erreur à l'utilisateur
//     }
//   }

//   // Méthode optionnelle pour vérifier si on suit déjà un utilisateur
//   isFollowingUser(userId: string): boolean {
//     const user = this.users.find(u => u.uid === userId);
//     return user ? user.isFollowing || false : false;
//   }

//   // Méthode optionnelle pour voir le profil
//   viewProfile(userId: string) {
//     console.log('Voir profil:', userId);
//     // Implémentez la navigation vers le profil de l'utilisateur
//     // Par exemple: this.router.navigate(['/profile', userId]);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../services/user/user.service';
import { FollowService } from '../../services/follow/follow.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-discover-users',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './discover-users.component.html',
  styleUrls: ['./discover-users.component.css']
})
export class DiscoverUsersComponent implements OnInit {
  
  users: any[] = [];
  currentUserId!: string;
  sidebarOpen: boolean = true;
  isLoading: boolean = true;
  
  // Pour suivre l'état de suivi
  followingStatus: Map<string, boolean> = new Map();
  loadingFollowAction: Map<string, boolean> = new Map();

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.currentUser!.uid;
    this.isLoading = true;

    this.userService.getAllUsers().subscribe({
      next: async (users) => {
        this.users = users.filter(u => u.uid !== this.currentUserId);
        
        // Vérifier l'état de suivi pour chaque utilisateur
        await this.checkFollowingStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoading = false;
      }
    });
  }

  // Vérifier qui on suit déjà
  async checkFollowingStatus() {
    for (const user of this.users) {
      try {
        const isFollowing = await this.followService.isFollowing(this.currentUserId, user.uid);
        this.followingStatus.set(user.uid, isFollowing);
      } catch (error) {
        console.error(`Erreur lors de la vérification du suivi pour ${user.uid}:`, error);
        this.followingStatus.set(user.uid, false);
      }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Méthode pour suivre/ne plus suivre
  async toggleFollow(userId: string) {
    // Empêcher les clics multiples
    if (this.loadingFollowAction.get(userId)) return;
    
    this.loadingFollowAction.set(userId, true);
    
    try {
      const isCurrentlyFollowing = this.followingStatus.get(userId);
      
      if (isCurrentlyFollowing) {
        // Retirer le suivi
        await this.followService.unfollow(this.currentUserId, userId);
        this.followingStatus.set(userId, false);
      } else {
        // Suivre
        await this.followService.follow(this.currentUserId, userId);
        this.followingStatus.set(userId, true);
      }
      
      // Mettre à jour l'état local
      const user = this.users.find(u => u.uid === userId);
      if (user) {
        user.isFollowing = !isCurrentlyFollowing;
      }
      
    } catch (error) {
      console.error('Erreur lors de la manipulation du suivi:', error);
      // Optionnel: Afficher un message d'erreur
    } finally {
      this.loadingFollowAction.set(userId, false);
    }
  }

  // Méthode pour voir le profil
  viewProfile(userId: string) {
    console.log('Voir profil:', userId);
  }
  
  // Méthode pour vérifier si on suit un utilisateur
  isFollowingUser(userId: string): boolean {
    return this.followingStatus.get(userId) || false;
  }
}