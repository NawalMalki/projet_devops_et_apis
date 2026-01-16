import { Component, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { Auth, signOut } from "@angular/fire/auth";
import { NotificationService, Notification } from "../../services/notification.service";
import { Subscription } from "rxjs";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  searchQuery = "";
  showProfileMenu = false;
  showNotifications = false;
  
  notifications: Notification[] = [];
  unreadCount = 0;
  
  userProfile: UserProfile = {
    name: "Utilisateur",
    email: "user@bookbuddies.com",
    avatar: "https://ui-avatars.com/api/?name=User&background=667eea&color=fff",
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadNotifications();
    
    // S'abonner au compteur de notifications non lues
    const unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserProfile() {
    const user = this.auth.currentUser;
    if (user) {
      this.userProfile = {
        name: user.displayName || "Utilisateur",
        email: user.email || "user@bookbuddies.com",
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=667eea&color=fff`,
      };
    }
  }

  loadNotifications() {
    const notifSub = this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error("Erreur chargement notifications:", error);
      },
    });
    this.subscriptions.push(notifSub);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }


// REMPLACEZ la méthode onSearch() par ceci :
onSearch() {
  if (this.searchQuery.trim()) {
    // Détecter si c'est une recherche par auteur ou genre
    const query = this.searchQuery.trim();
    
    // Pattern pour détecter "par Auteur" ou "genre Genre"
    const authorMatch = query.match(/par\s+(.+)/i);
    const genreMatch = query.match(/genre\s+(.+)/i);
    
    let searchType = 'titre'; // par défaut
    let searchTerm = query;
    
    if (authorMatch) {
      searchType = 'auteur';
      searchTerm = authorMatch[1].trim();
    } else if (genreMatch) {
      searchType = 'genre';
      searchTerm = genreMatch[1].trim();
    }
    
    // Naviguer vers home avec la recherche et son type
    this.router.navigate(['/home'], {
      queryParams: { 
        search: searchTerm,
        type: searchType 
      },
    });
  }
}

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.onSearch();
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
    }
  }

  onNotificationClick(notification: Notification) {
    // Marquer comme lue
    if (!notification.isRead && notification.id) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.loadNotifications(); // Recharger
      });
    }

    // Naviguer vers le livre si bookId existe
    if (notification.bookId) {
      this.router.navigate(["/book", notification.bookId]);
      this.showNotifications = false;
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteNotification(event: Event, notificationId: string) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.loadNotifications();
    });
  }

  clearAllNotifications() {
    if (confirm("Voulez-vous vraiment supprimer toutes les notifications ?")) {
      this.notificationService.deleteAllNotifications().subscribe(() => {
        this.loadNotifications();
      });
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case "book_added":
        return "fas fa-book";
      case "book_finished":
        return "fas fa-check-circle";
      case "book_favorite":
        return "fas fa-star";
      case "reading_progress":
        return "fas fa-book-open";
      default:
        return "fas fa-bell";
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }

  async onLogout() {
    try {
      // Fermer le menu dropdown
      this.showProfileMenu = false
      
      // Déconnexion Firebase
      await signOut(this.auth)
      
      console.log('Déconnexion réussie')
      
      // Rediriger vers la page de connexion
      this.router.navigate(['/sign-in'])
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      alert('Erreur lors de la déconnexion. Veuillez réessayer.')
    }
  }
}