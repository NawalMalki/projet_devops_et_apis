import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  average,
  getAggregateFromServer,
  AggregateField,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

export interface Rating {
  id?: string;
  userId: string;
  bookId: string;
  rating: number; // 1-5
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // Ajouter ou mettre à jour une note
  async rateBook(bookId: string, rating: number): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId || rating < 1 || rating > 5) return;

    const ratingsRef = collection(this.firestore, 'ratings');
    
    // Vérifier si l'utilisateur a déjà noté ce livre
    const q = query(
      ratingsRef,
      where('bookId', '==', bookId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.size > 0) {
      // Mettre à jour la note existante
      const existingRating = snapshot.docs[0];
      await updateDoc(existingRating.ref, { rating });
    } else {
      // Créer une nouvelle note
      await addDoc(ratingsRef, {
        bookId,
        userId,
        rating,
        createdAt: Timestamp.now(),
      });
    }
  }

  // Obtenir la note de l'utilisateur actuel pour un livre
  async getUserRating(bookId: string): Promise<number | null> {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const ratingsRef = collection(this.firestore, 'ratings');
    const q = query(
      ratingsRef,
      where('bookId', '==', bookId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.size === 0) return null;

    return snapshot.docs[0].data()['rating'];
  }

  // Obtenir la note moyenne d'un livre
  async getAverageRating(bookId: string): Promise<number> {
    const ratingsRef = collection(this.firestore, 'ratings');
    const q = query(ratingsRef, where('bookId', '==', bookId));

    const snapshot = await getDocs(q);
    if (snapshot.size === 0) return 0;

    const ratings = snapshot.docs.map(doc => doc.data()['rating']);
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    
    return Math.round(average * 10) / 10; // Arrondir à 1 décimale
  }

  // Obtenir le nombre de votes pour un livre
  async getRatingCount(bookId: string): Promise<number> {
    const ratingsRef = collection(this.firestore, 'ratings');
    const q = query(ratingsRef, where('bookId', '==', bookId));

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Obtenir les notes des amis pour un livre
  async getFriendsRatings(bookId: string, friendIds: string[]): Promise<Rating[]> {
    const ratingsRef = collection(this.firestore, 'ratings');
    const q = query(ratingsRef, where('bookId', '==', bookId));

    const snapshot = await getDocs(q);
    const allRatings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Rating, 'id'>,
      createdAt: (doc.data()['createdAt'] as any).toDate?.() || new Date(),
    }));

    // Filtrer pour garder uniquement les amis
    return allRatings.filter(r => friendIds.includes(r.userId));
  }
}
