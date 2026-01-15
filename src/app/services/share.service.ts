import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ShareService {

  constructor(private firestore: Firestore) {}

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
  }
}
