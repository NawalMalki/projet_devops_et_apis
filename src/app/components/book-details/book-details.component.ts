import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import  { BooksService, Book } from "../../services/books/books.service"
import { HeaderComponent } from "../header/header.component"
import { SidebarComponent } from "../sidebar/sidebar.component"
import  { LibraryService } from "../../services/library/library.service"

import { Auth } from '@angular/fire/auth';
import { ShareService } from "../../services/share/share.service"
import { FollowService } from "../../services/follow/follow.service"

@Component({
  selector: "app-book-details",
  templateUrl: "./book-details.component.html",
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  styleUrls: ["./book-details.component.css"],
})


export class BookDetailsComponent implements OnInit {
  sidebarOpen = false
  book: Book | null = null
  isLoading = true
  error: string | null = null
  isInReading = false
  isInFavorites = false
  isFinished = false
  isLoadingStatus = true
  // pour share
  showShareDialog = false;
  friends: any[] = [];


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private booksService: BooksService,
    private libraryService: LibraryService,

    // ➕ AJOUT
    private auth: Auth,
    private followService: FollowService,
    private shareService: ShareService
  ) {}

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get("id")
    if (bookId) {
      this.loadBookDetails(bookId)
      this.loadBookStatus(bookId)
    } else {
      this.error = "ID du livre manquant"
      this.isLoading = false
    }
  }

  loadBookDetails(id: string) {
    this.isLoading = true
    this.error = null

    this.booksService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book
        this.isLoading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement du livre:", error)
        this.error = "Impossible de charger les détails du livre. Veuillez réessayer."
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

  goBack() {
    this.router.navigate(["/home"])
  }

  retry() {
    const bookId = this.route.snapshot.paramMap.get("id")
    if (bookId) {
      this.loadBookDetails(bookId)
    }
  }

  loadBookStatus(bookId: string) {
    this.isLoadingStatus = true

    Promise.all([
      this.libraryService.isInReading(bookId).toPromise(),
      this.libraryService.isInFavorites(bookId).toPromise(),
      this.libraryService.isFinished(bookId).toPromise(),
    ])
      .then(([reading, favorites, finished]) => {
        this.isInReading = reading || false
        this.isInFavorites = favorites || false
        this.isFinished = finished || false
        this.isLoadingStatus = false
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du statut:", error)
        this.isLoadingStatus = false
      })
  }

  startReading() {
    if (!this.book) return

    this.libraryService.addToReading(this.book).subscribe({
      next: () => {
        this.isInReading = true
        console.log("[v0] Livre ajouté à En cours de lecture")
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout:", error)
        alert("Erreur lors de l'ajout du livre. Veuillez vous connecter.")
      },
    })
  }

  continueReading() {
    this.router.navigate(["/reading"])
  }

  finishReading() {
    if (!this.book) return

    this.libraryService.markAsFinished(this.book).subscribe({
      next: () => {
        this.isInReading = false
        this.isFinished = true
        console.log("[v0] Livre marqué comme terminé")
      },
      error: (error) => {
        console.error("Erreur lors de la finalisation:", error)
        alert("Erreur lors de la finalisation du livre.")
      },
    })
  }

  toggleFavorite() {
    if (!this.book) return

    if (this.isInFavorites) {
      this.libraryService.removeFromFavorites(this.book.id).subscribe({
        next: () => {
          this.isInFavorites = false
          console.log("[v0] Livre retiré des favoris")
        },
        error: (error) => {
          console.error("Erreur lors du retrait:", error)
        },
      })
    } else {
      this.libraryService.addToFavorites(this.book).subscribe({
        next: () => {
          this.isInFavorites = true
          console.log("[v0] Livre ajouté aux favoris")
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout:", error)
          alert("Erreur lors de l'ajout aux favoris. Veuillez vous connecter.")
        },
      })
    }
  }

  async loadFriends() {
  const currentUserId = this.auth.currentUser?.uid;
  if (!currentUserId) return;

  this.friends = await this.followService.getFriends(currentUserId);
}

async shareWithFriend(friendId: string) {
  const currentUserId = this.auth.currentUser?.uid;
  if (!currentUserId || !this.book) return;

  await this.shareService.shareBook({
    bookId: this.book.id,
    bookTitle: this.book.title,
    bookCover: this.book.cover,
    fromUserId: currentUserId,
    toUserId: friendId
  });

  this.closeShareDialog();
}


  openShareDialog() {
    this.showShareDialog = true;
    this.loadFriends();
  }

  closeShareDialog() {
    this.showShareDialog = false;
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars: string[] = []

    for (let i = 0; i < fullStars; i++) {
      stars.push("full")
    }
    if (hasHalfStar) {
      stars.push("half")
    }
    while (stars.length < 5) {
      stars.push("empty")
    }

    return stars
  }
}
