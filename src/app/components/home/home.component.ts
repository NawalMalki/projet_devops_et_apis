import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { BooksService, Book } from "../../services/books.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  sidebarOpen = false;
  books: Book[] = [];
  isLoading = true;
  error: string | null = null;

  // Track the current search query
  searchQuery: string | null = null;

  constructor(
    private booksService: BooksService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Subscribe to query params to catch search queries
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['search'] || null;
      this.loadBooks(); // Reload books whenever search query changes
    });
  }

  onBookClick(book: Book) {
    this.router.navigate(["/book", book.id]);
  }

  loadBooks() {
    this.isLoading = true;
    this.error = null;

    let books$;

    if (this.searchQuery?.trim()) {
      // Use the search query from the header
      books$ = this.booksService.getBooks(this.searchQuery.trim());
    } else {
      // Default load
      books$ = this.booksService.getBooks("fiction");
    }

    books$.subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des livres:", error);
        this.error = "Impossible de charger les livres. Veuillez réessayer.";
        this.isLoading = false;
        this.books = this.getFallbackBooks();
      },
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  handleImageError(book: Book) {
    book.cover = this.getDefaultCover();
  }

  getDefaultCover(): string {
    return "https://via.placeholder.com/150x200/cccccc/666666?text=Couverture+non+disponible";
  }

  private getFallbackBooks(): Book[] {
    return [
      {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
        rating: 4.5,
        genre: "Fiction",
      },
      {
        id: "2",
        title: "1984",
        author: "George Orwell",
        cover: "https://covers.openlibrary.org/b/id/7222339-L.jpg",
        rating: 4.8,
        genre: "Fiction",
      },
      {
        id: "3",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        cover: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
        rating: 4.7,
        genre: "Fiction",
      },
      {
        id: "4",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        cover: "https://covers.openlibrary.org/b/id/8235657-L.jpg",
        rating: 4.6,
        genre: "Romance",
      },
    ];
  }
}
