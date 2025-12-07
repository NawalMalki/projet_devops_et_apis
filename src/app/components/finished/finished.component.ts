import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HeaderComponent } from "../header/header.component"
import { SidebarComponent } from "../sidebar/sidebar.component"
import { LibraryService, UserBook } from "../../services/library.service"

@Component({
  selector: "app-finished",
  templateUrl: "./finished.component.html",
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  styleUrls: ["./finished.component.css"],
})
export class FinishedComponent implements OnInit {
  sidebarOpen = false
  books: UserBook[] = []
  isLoading = true
  error: string | null = null

  constructor(
    public router: Router,
    private libraryService: LibraryService,
  ) {}

  ngOnInit() {
    this.loadFinishedBooks()
  }

  loadFinishedBooks() {
    this.isLoading = true
    this.error = null

    this.libraryService.getFinishedBooks().subscribe({
      next: (books) => {
        this.books = books
        this.isLoading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement:", error)
        this.error = "Impossible de charger vos livres. Veuillez réessayer."
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
}
