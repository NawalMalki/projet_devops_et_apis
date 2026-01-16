import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
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
}
