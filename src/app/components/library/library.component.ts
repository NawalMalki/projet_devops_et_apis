import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HeaderComponent } from "../header/header.component"
import { SidebarComponent } from "../sidebar/sidebar.component"
import { LibraryService, UserBook } from "../../services/library.service"

@Component({
  selector: "app-library",
  templateUrl: "./library.component.html",
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  styleUrls: ["./library.component.css"],
})
export class LibraryComponent implements OnInit {
  sidebarOpen = false
  books: UserBook[] = []
  isLoading = true
  error: string | null = null

  constructor(
    public router: Router,
    private libraryService: LibraryService,
  ) {}

  ngOnInit() {
    this.loadLibrary()
  }

  loadLibrary() {
    this.isLoading = true
    this.error = null

    this.libraryService.getLibrary().subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement de la bibliothèque:", error)
        this.error = "Impossible de charger votre bibliothèque. Veuillez réessayer."
        this.isLoading = false
      },
    })
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  formatRating(rating: number): string {
    return rating.toFixed(1)
  }

  onBookClick(book: UserBook) {
    this.router.navigate(["/book", book.id])
  }

  getStatusBadge(book: UserBook): string {
    if (book.status === "reading") return "En cours"
    if (book.status === "finished") return "Terminé"
    if (book.status === "favorite") return "Favori"
    return ""
  }

  getStatusClass(book: UserBook): string {
    if (book.status === "reading") return "status-reading"
    if (book.status === "finished") return "status-finished"
    if (book.status === "favorite") return "status-favorite"
    return ""
  }
}
