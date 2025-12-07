import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { SidebarComponent } from "../sidebar/sidebar.component"
import { HeaderComponent } from "../header/header.component"
import { BooksService, Book } from "../../services/books.service"
import { Subscription } from "rxjs"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  sidebarOpen = false
  
  allBooks: Book[] = []
  
  isLoading = false
  error: string | null = null
  currentGenre: string | null = null
  
  private queryParamsSubscription?: Subscription

  constructor(
    private booksService: BooksService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const genre = params['genre']
      
      if (genre) {
        this.currentGenre = genre
        this.loadBooksByGenre(genre)
      } else {
        this.currentGenre = null
        this.loadMixedBooks()
      }
    })
  }
  
  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe()
    }
  }

  /**
   * Charge un cocktail de livres de différents genres
   */
  loadMixedBooks() {
    this.isLoading = true
    this.error = null
    this.allBooks = []
    
    this.booksService.getMixedBooks(40).subscribe({
      next: (books) => {
        this.allBooks = books.filter(book => 
          book.cover && 
          !book.cover.includes('placeholder') &&
          book.title &&
          book.author
        )
        this.isLoading = false
        
        console.log('📚 Livres mélangés chargés:', this.allBooks.length)
        
        if (this.allBooks.length === 0) {
          this.error = "Aucun livre trouvé. Veuillez réessayer."
        }
      },
      error: (error) => {
        console.error("❌ Erreur lors du chargement des livres:", error)
        this.error = "Impossible de charger les livres. Veuillez réessayer."
        this.isLoading = false
        this.allBooks = []
      },
    })
  }

  /**
   * Charge les livres d'un genre spécifique
   */
  loadBooksByGenre(genre: string) {
    this.isLoading = true
    this.error = null
    this.allBooks = []
    
    console.log('🔍 Chargement du genre:', genre)
    
    this.booksService.getBooksByGenre(genre, 40).subscribe({
      next: (books) => {
        this.allBooks = books.filter(book => 
          book.cover && 
          !book.cover.includes('placeholder') &&
          book.title &&
          book.author
        )
        this.isLoading = false
        
        console.log(`📚 Livres "${genre}" chargés:`, this.allBooks.length)
        
        if (this.allBooks.length === 0) {
          this.error = `Aucun livre trouvé pour "${this.formatGenreName(genre)}"`
        }
      },
      error: (error) => {
        console.error(`❌ Erreur genre ${genre}:`, error)
        this.error = `Impossible de charger les livres "${this.formatGenreName(genre)}".`
        this.isLoading = false
        this.allBooks = []
      },
    })
  }

  /**
   * Formate le nom du genre pour l'affichage
   */
  formatGenreName(genre: string): string {
    const genreMap: { [key: string]: string } = {
      'fiction': 'Fiction',
      'romance': 'Romance',
      'science fiction': 'Science-Fiction',
      'thriller': 'Thriller',
      'fantasy': 'Fantaisie',
      'adventure': 'Aventure',
      'mystery': 'Mystère'
    }
    return genreMap[genre.toLowerCase()] || genre
  }

  /**
   * Retour à l'accueil (tous les livres)
   */
  resetToAllBooks() {
    this.router.navigate(['/home'])
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  onBookClick(book: Book) {
    this.router.navigate(["/book", book.id])
  }

  formatRating(rating: number): string {
    return rating.toFixed(1)
  }

  formatDate(date?: string): string {
    if (!date) return 'Date inconnue'
    const year = date.split('-')[0]
    return year
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/128x192/667eea/ffffff?text=Pas+de+couverture'
  }

  /**
   * Vérifie si un filtre de genre est actif
   */
  get hasGenreFilter(): boolean {
    return this.currentGenre !== null
  }

  /**
   * Obtient le nom du genre actuel formaté
   */
  get currentGenreFormatted(): string {
    return this.currentGenre ? this.formatGenreName(this.currentGenre) : ''
  }
}