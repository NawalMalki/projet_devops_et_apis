import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from "@angular/fire/firestore";
import { Auth } from "@angular/fire/auth";
import { Observable, from, map, of } from "rxjs";
import { Book } from "./books.service";

export interface UserBook extends Book {
  userId: string;
  addedAt: Date;
  status?: "reading" | "finished" | "favorite";
}

@Injectable({
  providedIn: "root",
})
export class LibraryService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // ---------------------------
  // Méthode utilitaire : supprime les champs undefined
  // ---------------------------
  private sanitizeForFirestore(data: any) {
    const sanitized: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        sanitized[key] = data[key];
      }
    });
    return sanitized;
  }

  // ---------------------------
  // ADD TO READING
  // ---------------------------
  addToReading(book: Book): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const readingCollection = collection(this.firestore, "en_cours_de_lecture");

    const bookData = this.sanitizeForFirestore({
      ...book,
      userId,
      addedAt: Timestamp.now(),
      status: "reading",
    });

    return from(addDoc(readingCollection, bookData).then(() => {}));
  }

  // ---------------------------
  // ADD TO FAVORITES
  // ---------------------------
  addToFavorites(book: Book): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const favoritesCollection = collection(this.firestore, "favoris");

    const bookData = this.sanitizeForFirestore({
      ...book,
      userId,
      addedAt: Timestamp.now(),
      status: "favorite",
    });

    return from(addDoc(favoritesCollection, bookData).then(() => {}));
  }

  // ---------------------------
  // MARK AS FINISHED
  // ---------------------------
  markAsFinished(book: Book): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    return from(
      this.removeFromReading(book.id)
        .toPromise()
        .then(() => {
          const finishedCollection = collection(this.firestore, "termines");

          const bookData = this.sanitizeForFirestore({
            ...book,
            userId,
            addedAt: Timestamp.now(),
            status: "finished",
          });

          return addDoc(finishedCollection, bookData).then(() => {});
        })
    );
  }

  // ---------------------------
  // CHECK IF IN READING
  // ---------------------------
  isInReading(bookId: string): Observable<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return of(false);

    const q = query(
      collection(this.firestore, "en_cours_de_lecture"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    );

    return from(getDocs(q)).pipe(map((s) => !s.empty));
  }

  // ---------------------------
  // CHECK IF FAVORITE
  // ---------------------------
  isInFavorites(bookId: string): Observable<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return of(false);

    const q = query(
      collection(this.firestore, "favoris"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    );

    return from(getDocs(q)).pipe(map((s) => !s.empty));
  }

  // ---------------------------
  // CHECK IF FINISHED
  // ---------------------------
  isFinished(bookId: string): Observable<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return of(false);

    const q = query(
      collection(this.firestore, "termines"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    );

    return from(getDocs(q)).pipe(map((s) => !s.empty));
  }

  // ---------------------------
  // REMOVE FROM READING
  // ---------------------------
  removeFromReading(bookId: string): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const q = query(
      collection(this.firestore, "en_cours_de_lecture"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    );

    return from(
      getDocs(q).then((snapshot) => {
        const toDelete = snapshot.docs.map((d) =>
          deleteDoc(doc(this.firestore, "en_cours_de_lecture", d.id))
        );
        return Promise.all(toDelete).then(() => {});
      })
    );
  }

  // ---------------------------
  // REMOVE FROM FAVORITES
  // ---------------------------
  removeFromFavorites(bookId: string): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const q = query(
      collection(this.firestore, "favoris"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    );

    return from(
      getDocs(q).then((snapshot) => {
        const toDelete = snapshot.docs.map((d) =>
          deleteDoc(doc(this.firestore, "favoris", d.id))
        );
        return Promise.all(toDelete).then(() => {});
      })
    );
  }

  // ---------------------------
  // GET READING BOOKS
  // ---------------------------
  getReadingBooks(): Observable<UserBook[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    const q = query(
      collection(this.firestore, "en_cours_de_lecture"),
      where("userId", "==", userId)
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            ...data,
            addedAt: data.addedAt?.toDate(),
          } as UserBook;
        })
      )
    );
  }

  // ---------------------------
  // GET FINISHED BOOKS
  // ---------------------------
  getFinishedBooks(): Observable<UserBook[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    const q = query(
      collection(this.firestore, "termines"),
      where("userId", "==", userId)
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            ...data,
            addedAt: data.addedAt?.toDate(),
          } as UserBook;
        })
      )
    );
  }

  // ---------------------------
  // GET FAVORITE BOOKS
  // ---------------------------
  getFavoriteBooks(): Observable<UserBook[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    const q = query(
      collection(this.firestore, "favoris"),
      where("userId", "==", userId)
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            ...data,
            addedAt: data.addedAt?.toDate(),
          } as UserBook;
        })
      )
    );
  }
  // ---------------------------
// REMOVE FROM ALL COLLECTIONS (Suppression complète)
// ---------------------------
removeFromAllCollections(bookId: string): Observable<void> {
  const userId = this.getCurrentUserId();
  if (!userId) throw new Error("Utilisateur non connecté");

  // Crée les requêtes pour toutes les collections
  const queries = [
    query(
      collection(this.firestore, "en_cours_de_lecture"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    ),
    query(
      collection(this.firestore, "termines"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    ),
    query(
      collection(this.firestore, "favoris"),
      where("userId", "==", userId),
      where("id", "==", bookId)
    ),
  ];

  // Récupère et supprime tous les documents trouvés
  return from(
    Promise.all(queries.map((q) => getDocs(q))).then((snapshots) => {
      const deletePromises: Promise<void>[] = [];

      snapshots.forEach((snapshot, index) => {
        const collectionNames = ["en_cours_de_lecture", "termines", "favoris"];
        snapshot.docs.forEach((docSnapshot) => {
          deletePromises.push(
            deleteDoc(
              doc(this.firestore, collectionNames[index], docSnapshot.id)
            )
          );
        });
      });

      return Promise.all(deletePromises).then(() => {});
    })
  );
}

// ---------------------------
// REMOVE FROM FINISHED (pour la page "Terminé")
// ---------------------------
removeFromFinished(bookId: string): Observable<void> {
  const userId = this.getCurrentUserId();
  if (!userId) throw new Error("Utilisateur non connecté");

  const q = query(
    collection(this.firestore, "termines"),
    where("userId", "==", userId),
    where("id", "==", bookId)
  );

  return from(
    getDocs(q).then((snapshot) => {
      const toDelete = snapshot.docs.map((d) =>
        deleteDoc(doc(this.firestore, "termines", d.id))
      );
      return Promise.all(toDelete).then(() => {});
    })
  );
}

  // ---------------------------
  // GET FULL LIBRARY
  // ---------------------------
  getLibrary(): Observable<UserBook[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    return from(
      Promise.all([
        getDocs(
          query(
            collection(this.firestore, "en_cours_de_lecture"),
            where("userId", "==", userId)
          )
        ),
        getDocs(
          query(
            collection(this.firestore, "termines"),
            where("userId", "==", userId)
          )
        ),
        getDocs(
          query(
            collection(this.firestore, "favoris"),
            where("userId", "==", userId)
          )
        ),
      ])
    ).pipe(
      map(([readingSnapshot, finishedSnapshot, favoritesSnapshot]) => {
        const books: UserBook[] = [];
        const seenIds = new Set<string>();

        [readingSnapshot, finishedSnapshot, favoritesSnapshot].forEach(
          (snapshot) => {
            snapshot.docs.forEach((doc) => {
              const data = doc.data() as any;
              const book: UserBook = {
                ...data,
                addedAt: data.addedAt?.toDate(),
              };

              if (!seenIds.has(book.id)) {
                seenIds.add(book.id);
                books.push(book);
              }
            });
          }
        );

        return books;
      })
    );
  }
}
