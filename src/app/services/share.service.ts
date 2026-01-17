import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ShareService {

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private notificationService: NotificationService
  ) {}

  async shareBook(data: {
    bookId: string;
    bookTitle: string;
    bookCover: string;
    fromUserId: string;
    toUserId: string;
  }) {
    const sharesRef = collection(this.firestore, 'shared_books');

    await addDoc(sharesRef, {
      ...data,
      createdAt: Timestamp.now()
    });

    // Créer une notification pour l'utilisateur avec qui on partage
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        const sharerName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Quelqu\'un';
        await this.notificationService.notifyBookShared(
          data.bookTitle,
          data.bookId,
          data.bookCover,
          sharerName,
          data.fromUserId,
          data.toUserId
        ).toPromise();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification de partage:', error);
      // Ne pas échouer l'opération de partage si la notification échoue
    }
  }

  getSharedBooksCount(): Observable<number> {
    const currentUserId = this.auth.currentUser?.uid;
    if (!currentUserId) {
      return from(Promise.resolve(0));
    }

    const sharesRef = collection(this.firestore, 'shared_books');
    const q = query(sharesRef, where('fromUserId', '==', currentUserId));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.size)
    );
  }

  // Vérifier si un livre a déjà été partagé avec un ami
  async isBookAlreadyShared(bookId: string, fromUserId: string, toUserId: string): Promise<boolean> {
    const sharesRef = collection(this.firestore, 'shared_books');
    const q = query(
      sharesRef,
      where('bookId', '==', bookId),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );

    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  }
}
