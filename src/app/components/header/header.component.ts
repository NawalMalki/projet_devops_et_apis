import { CommonModule } from "@angular/common"
import { Component, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { Auth, user, User, signOut } from '@angular/fire/auth'
import { Subscription } from 'rxjs'

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>()
  @Output() search = new EventEmitter<string>()

  showProfileMenu = false
  searchQuery = ""
  
  currentUser: User | null = null
  private userSubscription?: Subscription

  userProfile = {
    name: "Utilisateur",
    email: "user@example.com",
    avatar: "https://ui-avatars.com/api/?name=User&background=1a1a1a&color=fff",
  }

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'état de l'utilisateur
    this.userSubscription = user(this.auth).subscribe((currentUser) => {
      console.log('🔐 Utilisateur détecté dans le header:', currentUser)
      this.currentUser = currentUser
      
      if (currentUser) {
        // Mettre à jour le profil avec les données de l'utilisateur connecté
        this.userProfile = {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur',
          email: currentUser.email || 'email@example.com',
          avatar: currentUser.photoURL || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email || 'User')}&background=1a1a1a&color=fff`
        }
        console.log('✅ Profil utilisateur mis à jour:', this.userProfile)
      } else {
        console.log('❌ Aucun utilisateur connecté')
      }
    })
  }

  ngOnDestroy() {
    // Se désabonner pour éviter les fuites mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit()
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Naviguer vers home avec la requête de recherche
      this.router.navigate(["/home"], {
        queryParams: { search: this.searchQuery.trim() },
      })
      // Émettre l'événement de recherche pour le composant parent
      this.search.emit(this.searchQuery.trim())
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.onSearch()
    }
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