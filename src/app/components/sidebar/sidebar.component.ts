import { CommonModule } from "@angular/common"
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core"
import { Router, RouterModule, NavigationEnd } from "@angular/router"
import { BooksService } from "../../services/books/books.service"
import { forkJoin } from "rxjs"
import { filter } from "rxjs/operators"

interface Category {
  name: string
  icon: string
  query: string
  count: number
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false
  @Output() isOpenChange = new EventEmitter<boolean>()

  menuItems = [
    { label: "Accueil", route: "/home", active: true },
    { label: "Ma bibliothèque", route: "/library", active: false },
    { label: "En cours de lecture", route: "/reading", active: false },
    { label: "Terminés", route: "/finished", active: false },
    { label: "Favoris", route: "/favorites", active: false },
    { label: "Découvrir des lecteurs", route: "/discover-users", active: false },

  ]

  categories: Category[] = [
    { name: "Fiction", icon: "", query: "fiction", count: 0 },
    { name: "Romance", icon: "", query: "romance", count: 0 },
    { name: "Science-Fiction", icon: "", query: "science fiction", count: 0 },
    { name: "Thriller", icon: "", query: "thriller", count: 0 },
    { name: "Fantaisie", icon: "", query: "fantasy", count: 0 },
    { name: "Aventure", icon: "", query: "adventure", count: 0 },
    { name: "Mystère", icon: "", query: "mystery", count: 0 }
  ]

  isLoadingCounts = false

  constructor(
    private booksService: BooksService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGenreCounts()
    this.updateActiveMenuItem()
    
    // Écouter les changements de route pour mettre à jour l'élément actif
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveMenuItem()
    })
  }

  ngOnDestroy() {
    // Le pipe filter et subscribe gèrent automatiquement le nettoyage
  }

  /**
   * Met à jour l'élément de menu actif en fonction de la route actuelle
   */
  updateActiveMenuItem() {
    const currentUrl = this.router.url.split('?')[0] // Enlever les query params
    this.menuItems.forEach(item => {
      item.active = item.route === currentUrl
    })
  }

  /**
   * Charge le nombre de livres pour chaque genre
   */
  loadGenreCounts() {
    this.isLoadingCounts = true
    
    // Créer un tableau de requêtes pour chaque genre
    const requests = this.categories.map(category => 
      this.booksService.getGenreCount(category.query)
    )
    
    // Exécuter toutes les requêtes en parallèle
    forkJoin(requests).subscribe({
      next: (counts) => {
        this.categories.forEach((category, index) => {
          category.count = counts[index]
        })
        this.isLoadingCounts = false
        console.log('✅ Compteurs de genres chargés:', this.categories)
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des compteurs:', error)
        this.isLoadingCounts = false
      }
    })
  }

  onGenreClick(category: Category, event: Event) {
    event.preventDefault()
    console.log('🎯 Genre cliqué:', category.name, '→', category.query)
    this.router.navigate(["/home"], { 
      queryParams: { genre: category.query }
    })
    this.closeSidebar()
  }

  closeSidebar() {
    this.isOpenChange.emit(false)
  }

  onMenuItemClick(item: any) {
    this.menuItems.forEach((menuItem) => (menuItem.active = false))
    item.active = true
  }
}