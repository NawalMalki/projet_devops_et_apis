import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { SidebarComponent } from "../sidebar/sidebar.component"
import { HeaderComponent } from "../header/header.component"
import { BooksService, Book } from "../../services/books.service"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  sidebarOpen = false
  books: Book[] = []
  isLoading = false
  error: string | null = null

  constructor(
    private booksService: BooksService,
    private router: Router,
    private route: ActivatedRoute  // ✅ AJOUTÉ pour écouter les queryParams
  ) {}

  ngOnInit() {
    // ✅ NOUVEAU : Écouter les changements de genre depuis la sidebar
    this.route.queryParams.subscribe(params => {
      const genre = params['genre']
      
      if (genre) {
        // Si un genre est sélectionné, charger les livres de ce genre
        this.loadBooksByGenre(genre)
      } else {
        // Sinon, charger tous les livres
        this.loadBooks()
      }
    })
  }

  loadBooks() {
    this.isLoading = true
    this.error = null
    
    this.booksService.getBooks("fiction", 40).subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement des livres:", error)
        this.error = "Impossible de charger les livres. Veuillez réessayer."
        this.isLoading = false
      },
    })
  }

  // ✅ NOUVELLE MÉTHODE pour charger par genre
  loadBooksByGenre(genre: string) {
    this.isLoading = true
    this.error = null
    
    this.booksService.getBooksByGenre(genre, 40).subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
        
        if (books.length === 0) {
          this.error = `Aucun livre trouvé pour "${genre}"`
        }
      },
      error: (error) => {
        console.error(`Erreur genre ${genre}:`, error)
        this.error = `Impossible de charger "${genre}".`
        this.isLoading = false
      },
    })
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
}