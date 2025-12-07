import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, map, of } from "rxjs"

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

  // Recherche de livres avec filtres AMÉLIORÉS
  getBooks(query = "fiction", maxResults = 40): Observable<Book[]> {
    // Augmenté maxResults pour avoir PLUS de livres
    // filter=ebooks pour de vrais livres (pas d'articles scientifiques)
    const url = `${this.apiUrl}?q=${query}&maxResults=${maxResults}&printType=books&orderBy=relevance&langRestrict=fr&filter=ebooks`

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (!response.items) return []

        return response.items
          .filter((item: any) => {
            const volumeInfo = item.volumeInfo
            // Filtrer les trucs moches (articles scientifiques, etc.)
            return (
              volumeInfo.imageLinks?.thumbnail && // Doit avoir une couverture
              volumeInfo.authors && // Doit avoir un auteur
              volumeInfo.description && // Doit avoir une description
              volumeInfo.categories && // Doit avoir des catégories
              volumeInfo.pageCount > 50 && // Au moins 50 pages
              !volumeInfo.title.toLowerCase().includes("journal") &&
              !volumeInfo.title.toLowerCase().includes("article") &&
              !volumeInfo.title.toLowerCase().includes("proceedings")
            )
          })
          .map((item: any) => {
            const volumeInfo = item.volumeInfo
            return {
              id: item.id,
              title: volumeInfo.title,
              author: volumeInfo.authors.join(", "),
              cover: volumeInfo.imageLinks.thumbnail.replace("http:", "https:"), // ✅ HTTPS
              rating: volumeInfo.averageRating || Math.random() * 1.5 + 3.5,
              genre: volumeInfo.categories[0],
              description: volumeInfo.description,
              publishedDate: volumeInfo.publishedDate,
            }
          })
      }),
    )
  }

  // Recherche par genre avec de VRAIS livres populaires
  getBooksByGenre(genre: string, maxResults = 40): Observable<Book[]> {
    // Query simple et efficace par genre
    const query = `subject:${genre.toLowerCase()}`
    return this.getBooks(query, maxResults)
  }

  // Recherche de livres populaires (bestsellers)
  getPopularBooks(maxResults = 15): Observable<Book[]> {
    // Requêtes populaires selon la doc
    const queries = [
      'bestseller',
      'best seller fiction',
      'popular books',
      'award winning books'
    ]

    const randomQuery = queries[Math.floor(Math.random() * queries.length)]
    return this.getBooks(randomQuery, maxResults)
  }

  // Récupérer un livre par ID
  getBookById(id: string): Observable<Book> {
    const url = `${this.apiUrl}/${id}`
    return this.http.get<any>(url).pipe(
      map((item) => {
        const volumeInfo = item.volumeInfo
        return {
          id: item.id,
          title: volumeInfo.title || "Titre non disponible",
          author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Auteur inconnu",
          cover: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.thumbnail.replace("http:", "https:")
            : this.getDefaultCover(),
          rating: volumeInfo.averageRating || Math.random() * 2 + 3,
          genre: volumeInfo.categories ? volumeInfo.categories[0] : "Général",
          description: volumeInfo.description,
          publishedDate: volumeInfo.publishedDate,
        }
      }),
    )
  }

  // Récupérer les genres disponibles DEPUIS L'API
  getGenres(): Observable<Genre[]> {
    if (this.genresCache) {
      return of(this.genresCache)
    }

    // Récupérer BEAUCOUP plus de livres pour avoir tous les genres
    // On fait plusieurs requêtes en parallèle pour diversifier
    const queries = [
      "fiction",
      "thriller",
      "fantasy",
      "romance",
      "mystery",
      "adventure",
      "science fiction",
      "historical"
    ]

    // Faire plusieurs appels en parallèle
    const requests = queries.map(query => this.getBooks(query, 40))
    
    return new Observable<Genre[]>(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(results => {
          const allBooks = results.flat().filter(book => book !== undefined)
          const genreMap: { [key: string]: number } = {}

          allBooks.forEach((book) => {
            const genre = book.genre || "Général"
            genreMap[genre] = (genreMap[genre] || 0) + 1
          })

          const genres: Genre[] = Object.keys(genreMap)
            .map((name) => ({
              name,
              count: genreMap[name],
            }))
            .sort((a, b) => b.count - a.count) // Trier par popularité
            .slice(0, 15) // Top 15 genres seulement

          this.genresCache = genres
          observer.next(genres)
          observer.complete()
        })
        .catch(error => observer.error(error))
    })
  }

  // Image par défaut
  private getDefaultCover(): string {
    return "https://via.placeholder.com/150x200/667eea/ffffff?text=📚"
  }
}