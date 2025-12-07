import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, map, of, forkJoin } from "rxjs"

export interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string
  description?: string
  publishedDate?: string
  pageCount?: number
  language?: string
}

export interface Genre {
  name: string
  count: number
  icon: string
  query: string
}

@Injectable({
  providedIn: "root",
})
export class BooksService {
  private apiUrl = "https://www.googleapis.com/books/v1/volumes"
  // ❌ PLUS BESOIN DE CLÉ API !
  private genresCache: Genre[] | null = null

  constructor(private http: HttpClient) {}

  /**
   * Récupère un cocktail de livres de différents genres
   */
  getMixedBooks(maxResults = 40): Observable<Book[]> {
    const genres = ['fiction', 'romance', 'adventure', 'mystery', 'thriller', 'fantasy']
    
    const selectedGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 3)
    
    const requests = selectedGenres.map(genre => {
      const query = `subject:${genre}`
      
      const params = new HttpParams()
        .set('q', query)
        .set('langRestrict', 'fr')  // ✅ Utilise langRestrict au lieu de language:fr
        .set('orderBy', 'relevance')
        .set('maxResults', Math.floor(40 / 3).toString())
      
      return this.http.get<any>(this.apiUrl, { params })
    })
    
    return forkJoin(requests).pipe(
      map((responses) => {
        const allBooks: Book[] = []
        
        responses.forEach(response => {
          if (response.items) {
            const books = response.items
              .map((item: any) => this.mapToBook(item))
              .filter((book: Book) => book.cover && !book.cover.includes('placeholder'))
            
            allBooks.push(...books)
          }
        })
        
        return allBooks.sort(() => 0.5 - Math.random())
      })
    )
  }

  getFrenchLiteratureBooks(maxResults = 40): Observable<Book[]> {
    const query = 'subject:fiction'
    
    const params = new HttpParams()
      .set('q', query)
      .set('langRestrict', 'fr')
      .set('orderBy', 'newest')
      .set('maxResults', maxResults.toString())
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }

        return response.items
          .map((item: any) => this.mapToBook(item))
          .filter((book: Book) => {
            const hasGoodCover = book.cover && !book.cover.includes('placeholder')
            const hasDate = book.publishedDate
            const isRecent = hasDate ? parseInt(book.publishedDate!.split('-')[0]) >= 1990 : true
            
            return hasGoodCover && isRecent
          })
          .sort((a: { publishedDate: any }, b: { publishedDate: any }) => {
            const dateA = new Date(a.publishedDate || '2000').getTime()
            const dateB = new Date(b.publishedDate || '2000').getTime()
            return dateB - dateA
          })
      }),
    )
  }

  getFrenchBestsellers(maxResults = 20): Observable<Book[]> {
    const query = 'subject:fiction'
    
    const params = new HttpParams()
      .set('q', query)
      .set('langRestrict', 'fr')
      .set('orderBy', 'newest')
      .set('maxResults', maxResults.toString())
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }
        return response.items
          .map((item: any) => this.mapToBook(item))
          .filter((book: Book) => 
            book.cover && 
            !book.cover.includes('placeholder')
          )
      }),
    )
  }

  getFrenchClassics(maxResults = 20): Observable<Book[]> {
    const query = 'subject:adventure'
    
    const params = new HttpParams()
      .set('q', query)
      .set('langRestrict', 'fr')
      .set('orderBy', 'newest')
      .set('maxResults', maxResults.toString())
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }
        return response.items
          .map((item: any) => this.mapToBook(item))
          .filter((book: Book) => 
            book.cover && 
            !book.cover.includes('placeholder')
          )
      }),
    )
  }

  getBooks(query = "fiction", maxResults = 12): Observable<Book[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('langRestrict', 'fr')
      .set('maxResults', Math.min(maxResults, 40).toString())
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }
        return response.items.map((item: any) => this.mapToBook(item))
      }),
    )
  }

  getBooksByGenre(genre: string, maxResults = 40): Observable<Book[]> {
    const genreQueries: { [key: string]: string } = {
      'fiction': 'subject:fiction',
      'romance': 'subject:romance',
      'science fiction': 'subject:science fiction',
      'thriller': 'subject:thriller',
      'fantasy': 'subject:fantasy',
      'adventure': 'subject:adventure',
      'mystery': 'subject:mystery'
    }
    
    const query = genreQueries[genre.toLowerCase()] || `subject:${genre}`
    
    const params = new HttpParams()
      .set('q', query)
      .set('langRestrict', 'fr')
      .set('orderBy', 'relevance')
      .set('maxResults', Math.min(maxResults, 40).toString())
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return []
        }
        
        return response.items
          .map((item: any) => this.mapToBook(item))
          .filter((book: Book) => 
            book.cover && 
            !book.cover.includes('placeholder') &&
            book.title &&
            book.author
          )
      })
    )
  }

  getGenreCount(genre: string): Observable<number> {
    return this.getBooksByGenre(genre, 40).pipe(
      map(books => books.length)
    )
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((item) => this.mapToBook(item))
    )
  }

  getGenres(): Observable<Genre[]> {
    if (this.genresCache) {
      return of(this.genresCache)
    }

    return this.getFrenchLiteratureBooks(40).pipe(
      map((books) => {
        const genreMap: { [key: string]: number } = {}

        books.forEach((book) => {
          const genre = book.genre || "Général"
          if (genreMap[genre]) {
            genreMap[genre]++
          } else {
            genreMap[genre] = 1
          }
        })

        const genres: Genre[] = Object.keys(genreMap).map((name) => ({
          name,
          count: genreMap[name],
          icon: '📚',
          query: name.toLowerCase()
        }))

        this.genresCache = genres
        return genres
      })
    )
  }

  private mapToBook(item: any): Book {
    const volumeInfo = item.volumeInfo || {}
    
    let coverUrl = this.getDefaultCover()
    
    if (volumeInfo.imageLinks) {
      if (volumeInfo.imageLinks.extraLarge) {
        coverUrl = volumeInfo.imageLinks.extraLarge
      } else if (volumeInfo.imageLinks.large) {
        coverUrl = volumeInfo.imageLinks.large
      } else if (volumeInfo.imageLinks.medium) {
        coverUrl = volumeInfo.imageLinks.medium
      } else if (volumeInfo.imageLinks.thumbnail) {
        coverUrl = volumeInfo.imageLinks.thumbnail
      } else if (volumeInfo.imageLinks.smallThumbnail) {
        coverUrl = volumeInfo.imageLinks.smallThumbnail
      }
      
      coverUrl = coverUrl
        .replace('http:', 'https:')
        .replace('&edge=curl', '')
        .replace('zoom=1', 'zoom=0')
        .replace('zoom=5', 'zoom=0')
      
      if (item.id) {
        coverUrl = `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w400-h600&source=gbs_api`
      }
    }
    
    return {
      id: item.id,
      title: volumeInfo.title || "Titre non disponible",
      author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Auteur inconnu",
      cover: coverUrl,
      rating: volumeInfo.averageRating || this.generateRealisticRating(),
      genre: volumeInfo.categories ? volumeInfo.categories[0] : "Général",
      description: volumeInfo.description,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      language: volumeInfo.language
    }
  }

  private generateRealisticRating(): number {
    return Math.round((Math.random() * 1.3 + 3.5) * 10) / 10
  }

  private getDefaultCover(): string {
    return "https://via.placeholder.com/128x192/667eea/ffffff?text=Pas+de+couverture"
  }
}