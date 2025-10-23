import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  sidebarOpen = false;

  books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg', rating: 4.5, genre: 'Fiction' },
    { id: 2, title: '1984', author: 'George Orwell', cover: 'https://covers.openlibrary.org/b/id/7222339-L.jpg', rating: 4.8, genre: 'Fiction' },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: 'https://covers.openlibrary.org/b/id/8228691-L.jpg', rating: 4.7, genre: 'Fiction' },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', cover: 'https://covers.openlibrary.org/b/id/8235657-L.jpg', rating: 4.6, genre: 'Romance' },
  ];

  toggleSidebar() {
    console.log('[DEBUG] Before toggle:', this.sidebarOpen);
    this.sidebarOpen = !this.sidebarOpen;
    console.log('[DEBUG] After toggle:', this.sidebarOpen);
  }
}