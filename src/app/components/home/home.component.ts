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
  isSearchActive = false;
  searchQuery: string = "";
  searchType: string = ""; // 'title', 'author', 'genre'
  
  private queryParamsSubscription?: Subscription

  constructor(
    private booksService: BooksService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const genre = params['genre']
      const search = params['search']
      const type = params['type'] || 'title' // Nouveau: type de recherche
      
      if (search) {
        this.searchQuery = search
        this.currentGenre = null
        this.isSearchActive = true
        this.searchType = type
        
        // Déterminer le type de recherche
        if (type === 'author') {
          this.performAuthorSearch(search)
        } else if (type === 'genre') {
          this.performGenreSearch(search)
        } else {
          // Par défaut : recherche par titre
          this.performExactSearch(search)
        }
      } else if (genre) {
        // Chargement par genre
        this.searchQuery = ""
        this.currentGenre = genre
        this.isSearchActive = false
        this.searchType = ""
        this.loadBooksByGenre(genre)
      } else {
        // Accueil normal
        this.searchQuery = ""
        this.currentGenre = null
        this.isSearchActive = false
        this.searchType = ""
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
   * Recherche exacte par titre
   */
  performExactSearch(query: string) {
    this.isLoading = true
    this.error = null
    this.allBooks = []
    this.isSearchActive = true
    this.searchQuery = query
    this.searchType = 'title'
    
    console.log(`🔍 Recherche par TITRE pour: "${query}"`);
    
    this.booksService.searchExactTitle(query).subscribe({
      next: (books) => {
        this.allBooks = books
        this.isLoading = false
        
        if (books.length === 0) {
          this.error = `Aucun livre trouvé pour "${query}"`
        } else {
          console.log(`✅ ${books.length} livre(s) trouvé(s) pour "${query}"`);
        }
      },
      error: (error) => {
        console.error(`Erreur recherche "${query}":`, error)
        this.error = `Erreur lors de la recherche pour "${query}".`
        this.isLoading = false
        this.allBooks = []
      },
    })
  }

  /**
   * Recherche par auteur
   */
  performAuthorSearch(authorName: string) {
    this.isLoading = true
    this.error = null
    this.allBooks = []
    this.isSearchActive = true
    this.searchQuery = authorName
    this.searchType = 'author'
    
    console.log(`🔍 Recherche par AUTEUR pour: "${authorName}"`);
    
    this.booksService.searchByAuthor(authorName).subscribe({
      next: (books) => {
        this.allBooks = books
        this.isLoading = false
        
        if (books.length === 0) {
          this.error = `Aucun livre trouvé pour l'auteur "${authorName}"`
        } else {
          console.log(`✅ ${books.length} livre(s) trouvé(s) pour l'auteur "${authorName}"`);
        }
      },
      error: (error) => {
        console.error(`Erreur recherche auteur "${authorName}":`, error)
        this.error = `Erreur lors de la recherche pour l'auteur "${authorName}".`
        this.isLoading = false
        this.allBooks = []
      },
    })
  }

  /**
   * Recherche par genre
   */
  performGenreSearch(genreName: string) {
    this.isLoading = true
    this.error = null
    this.allBooks = []
    this.isSearchActive = true
    this.searchQuery = genreName
    this.searchType = 'genre'
    
    console.log(`🔍 Recherche par GENRE pour: "${genreName}"`);
    
    this.booksService.searchByGenre(genreName).subscribe({
      next: (books) => {
        this.allBooks = books
        this.isLoading = false
        
        if (books.length === 0) {
          this.error = `Aucun livre trouvé pour le genre "${genreName}"`
        } else {
          console.log(`✅ ${books.length} livre(s) trouvé(s) pour le genre "${genreName}"`);
        }
      },
      error: (error) => {
        console.error(`Erreur recherche genre "${genreName}":`, error)
        this.error = `Erreur lors de la recherche pour le genre "${genreName}".`
        this.isLoading = false
        this.allBooks = []
      },
    })
  }

  /**
   * Effacer la recherche
   */
  clearSearch() {
    this.searchQuery = ""
    this.isSearchActive = false
    this.searchType = ""
    this.router.navigate(['/home'])
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
      'mystery': 'Mystère',
      'biography': 'Biographie',
      'history': 'Histoire',
      'science': 'Science',
      'poetry': 'Poésie',
      'drama': 'Drame',
      'comedy': 'Comédie'
    }
    return genreMap[genre.toLowerCase()] || this.capitalizeFirstLetter(genre)
  }

  /**
   * Capitalise la première lettre
   */
  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
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

  /**
   * Obtient le nom du type de recherche formaté
   */
  get searchTypeFormatted(): string {
    switch(this.searchType) {
      case 'author': return 'Auteur';
      case 'genre': return 'Genre';
      case 'title': return 'Titre';
      default: return '';
    }
  }

  /**
   * Vérifie si on affiche une seule carte de livre (recherche par titre avec un seul résultat)
   */
  get showSingleBookCard(): boolean {
    return this.isSearchActive && 
           this.searchType === 'title' && 
           this.allBooks.length === 1
  }

  /**
   * Vérifie si on affiche une grille de livres (recherche multiple)
   */
  get showBooksGrid(): boolean {
    return (!this.isSearchActive && this.allBooks.length > 0) ||
           (this.isSearchActive && 
            (this.searchType === 'author' || this.searchType === 'genre') && 
            this.allBooks.length > 0) ||
           (this.isSearchActive && this.searchType === 'title' && this.allBooks.length > 1)
  }
}