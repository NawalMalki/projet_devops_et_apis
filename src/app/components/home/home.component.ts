// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { HeaderComponent } from '../header/header.component';
// import { SidebarComponent } from '../sidebar/sidebar.component';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   standalone: true,
//   imports: [CommonModule, HeaderComponent, SidebarComponent],
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent {
//   sidebarOpen = false;

// // ici il faut remplacer les books statics par les books recuperes par api
//   books = [
//     { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg', rating: 4.5, genre: 'Fiction' },
//     { id: 2, title: '1984', author: 'George Orwell', cover: 'https://covers.openlibrary.org/b/id/7222339-L.jpg', rating: 4.8, genre: 'Fiction' },
//     { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: 'https://covers.openlibrary.org/b/id/8228691-L.jpg', rating: 4.7, genre: 'Fiction' },
//     { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', cover: 'https://covers.openlibrary.org/b/id/8235657-L.jpg', rating: 4.6, genre: 'Romance' },
//   ];

//   toggleSidebar() {
//     console.log('[DEBUG] Before toggle:', this.sidebarOpen);
//     this.sidebarOpen = !this.sidebarOpen;
//     console.log('[DEBUG] After toggle:', this.sidebarOpen);
//   }
// }
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BooksService, Book } from '../../services/books.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, HttpClientModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sidebarOpen = false;
  books: Book[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private booksService: BooksService) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;
    this.error = null;

    this.booksService.getBooks('fiction').subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livres:', error);
        this.error = 'Impossible de charger les livres. Veuillez réessayer.';
        this.isLoading = false;
        this.books = this.getFallbackBooks();
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Méthode pour formater la note
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  // Méthode pour gérer les erreurs d'image
  handleImageError(book: Book) {
    book.cover = this.getDefaultCover();
  }

  // Méthode pour gérer le clic sur un livre
  onBookClick(book: Book) {
    console.log('Livre sélectionné:', book);
  }

  // Image par défaut
  getDefaultCover(): string {
    return 'https://via.placeholder.com/150x200/cccccc/666666?text=Couverture+non+disponible';
  }

  // Données de secours
  private getFallbackBooks(): Book[] {
    return [
      { 
        id: '1', 
        title: 'The Great Gatsby', 
        author: 'F. Scott Fitzgerald', 
        cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg', 
        rating: 4.5, 
        genre: 'Fiction' 
      },
      { 
        id: '2', 
        title: '1984', 
        author: 'George Orwell', 
        cover: 'https://covers.openlibrary.org/b/id/7222339-L.jpg', 
        rating: 4.8, 
        genre: 'Fiction' 
      },
      { 
        id: '3', 
        title: 'To Kill a Mockingbird', 
        author: 'Harper Lee', 
        cover: 'https://covers.openlibrary.org/b/id/8228691-L.jpg', 
        rating: 4.7, 
        genre: 'Fiction' 
      },
      { 
        id: '4', 
        title: 'Pride and Prejudice', 
        author: 'Jane Austen', 
        cover: 'https://covers.openlibrary.org/b/id/8235657-L.jpg', 
        rating: 4.6, 
        genre: 'Romance' 
      },
    ];
  }
}