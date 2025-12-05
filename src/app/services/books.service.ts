import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import {  Observable, map, of } from "rxjs"

export interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string
  description?: string
  publishedDate?: string
}

export interface Genre {
  name: string
  count: number
}

@Injectable({
  providedIn: "root",
})
export class BooksService {
  private apiUrl = "https://www.googleapis.com/books/v1/volumes"
  private genresCache: Genre[] | null = null

  constructor(private http: HttpClient) {}

  // Récupérer les livres par recherche
  getBooks(query = "fiction", maxResults = 12): Observable<Book[]> {
    return this.http.get<any>(`${this.apiUrl}?q=${query}&maxResults=${maxResults}`).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }

        return response.items.map((item: any) => {
          const volumeInfo = item.volumeInfo
          return {
            id: item.id,
            title: volumeInfo.title || "Titre non disponible",
            author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Auteur inconnu",
            cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : this.getDefaultCover(),
            rating: volumeInfo.averageRating || Math.random() * 2 + 3,
            genre: volumeInfo.categories ? volumeInfo.categories[0] : "Général",
            description: volumeInfo.description,
            publishedDate: volumeInfo.publishedDate,
          }
        })
      }),
    )
  }

  getBooksByGenre(genre: string, maxResults = 12): Observable<Book[]> {
    return this.getBooks(`subject:${genre}`, maxResults)
  }

  // Récupérer un livre par ID
  getBookById(id: string): Observable<Book> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((item) => {
        const volumeInfo = item.volumeInfo
        return {
          id: item.id,
          title: volumeInfo.title || "Titre non disponible",
          author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Auteur inconnu",
          cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : this.getDefaultCover(),
          rating: volumeInfo.averageRating || Math.random() * 2 + 3,
          genre: volumeInfo.categories ? volumeInfo.categories[0] : "Général",
          description: volumeInfo.description,
          publishedDate: volumeInfo.publishedDate,
        }
      }),
    )
  }

 getGenres(): Observable<Genre[]> {
  // If cached, return cache
  if (this.genresCache) {
    return of(this.genresCache);
  }

  // Fetch a bunch of books (can adjust query and maxResults)
  return this.getBooks("fiction", 40).pipe(
    map((books) => {
      const genreMap: { [key: string]: number } = {};

      books.forEach((book) => {
        const genre = book.genre || "Général";
        if (genreMap[genre]) {
          genreMap[genre]++;
        } else {
          genreMap[genre] = 1;
        }
      });

      // Convert map to array of {name, count}
      const genres: Genre[] = Object.keys(genreMap).map((name) => ({
        name,
        count: genreMap[name],
      }));

      // Cache result
      this.genresCache = genres;

      return genres;
    })
  );
}


  // Image par défaut si pas de couverture
  private getDefaultCover(): string {
    return "https://via.placeholder.com/150x200/cccccc/666666?text=Couverture+non+disponible"
  }
}
