// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class BooksService {

//   constructor() { }
//   // api url
//   // https://www.googleapis.com/books/v1/volumes?q=book
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  genre: string;
  description?: string;
  publishedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) { }

  // Récupérer les livres par recherche
  getBooks(query: string = 'fiction'): Observable<Book[]> {
    return this.http.get<any>(`${this.apiUrl}?q=${query}&maxResults=12`).pipe(
      map(response => {
        if (!response.items) {
          return [];
        }
        
        return response.items.map((item: any) => {
          const volumeInfo = item.volumeInfo;
          return {
            id: item.id,
            title: volumeInfo.title || 'Titre non disponible',
            author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Auteur inconnu',
            cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : this.getDefaultCover(),
            rating: volumeInfo.averageRating || Math.random() * 2 + 3, // Note aléatoire entre 3 et 5 si non disponible
            genre: volumeInfo.categories ? volumeInfo.categories[0] : 'Général',
            description: volumeInfo.description,
            publishedDate: volumeInfo.publishedDate
          };
        });
      })
    );
  }

  // Récupérer un livre par ID
  getBookById(id: string): Observable<Book> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => {
        const volumeInfo = item.volumeInfo;
        return {
          id: item.id,
          title: volumeInfo.title || 'Titre non disponible',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Auteur inconnu',
          cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : this.getDefaultCover(),
          rating: volumeInfo.averageRating || Math.random() * 2 + 3,
          genre: volumeInfo.categories ? volumeInfo.categories[0] : 'Général',
          description: volumeInfo.description,
          publishedDate: volumeInfo.publishedDate
        };
      })
    );
  }

  // Image par défaut si pas de couverture
  private getDefaultCover(): string {
    return 'https://via.placeholder.com/150x200/cccccc/666666?text=Couverture+non+disponible';
  }
}