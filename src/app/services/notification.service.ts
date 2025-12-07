import { Injectable } from "@angular/core";
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
  deleteDoc,
} from "@angular/fire/firestore";
import { Auth } from "@angular/fire/auth";
import { Observable, from, map, of, BehaviorSubject } from "rxjs";

export interface Notification {
  id?: string;
  userId: string;
  type: "book_added" | "book_finished" | "book_favorite" | "reading_progress";
  title: string;
  message: string;
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private firestore: Firestore, private auth: Auth) {
    this.loadUnreadCount();
  }

  private getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  createNotification(notification: Omit<Notification, "id" | "userId" | "isRead" | "createdAt">): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const notificationsCollection = collection(this.firestore, "notifications");

    const notificationData = {
      ...notification,
      userId,
      isRead: false,
      createdAt: Timestamp.now(),
    };

    return from(
      addDoc(notificationsCollection, notificationData).then(() => {
        this.loadUnreadCount();
      })
    );
  }

  // VERSION SIMPLIFIÉE (sans orderBy) pour éviter les index
  getNotifications(): Observable<Notification[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    const q = query(
      collection(this.firestore, "notifications"),
      where("userId", "==", userId)
      // TEMPORAIREMENT RETIRÉ: orderBy("createdAt", "desc")
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as Notification;
        });
        
        // Trier côté client en attendant l'index
        return notifications.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
      })
    );
  }

  // VERSION SIMPLIFIÉE (sans orderBy)
  getUnreadNotifications(): Observable<Notification[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return of([]);

    const q = query(
      collection(this.firestore, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
      // TEMPORAIREMENT RETIRÉ: orderBy("createdAt", "desc")
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as Notification;
        });
        
        // Trier côté client
        return notifications.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
      })
    );
  }

  loadUnreadCount(): void {
    this.getUnreadNotifications().subscribe({
      next: (notifications) => {
        this.unreadCountSubject.next(notifications.length);
      },
      error: (error) => {
        console.error("Erreur compteur notifications:", error);
      },
    });
  }

  markAsRead(notificationId: string): Observable<void> {
    const notificationRef = doc(this.firestore, "notifications", notificationId);

    return from(
      updateDoc(notificationRef, { isRead: true }).then(() => {
        this.loadUnreadCount();
      })
    );
  }

  markAllAsRead(): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const q = query(
      collection(this.firestore, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    return from(
      getDocs(q).then((snapshot) => {
        const updates = snapshot.docs.map((d) =>
          updateDoc(doc(this.firestore, "notifications", d.id), { isRead: true })
        );
        return Promise.all(updates).then(() => {
          this.loadUnreadCount();
        });
      })
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return from(
      deleteDoc(doc(this.firestore, "notifications", notificationId)).then(() => {
        this.loadUnreadCount();
      })
    );
  }

  deleteAllNotifications(): Observable<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Utilisateur non connecté");

    const q = query(
      collection(this.firestore, "notifications"),
      where("userId", "==", userId)
    );

    return from(
      getDocs(q).then((snapshot) => {
        const deletes = snapshot.docs.map((d) =>
          deleteDoc(doc(this.firestore, "notifications", d.id))
        );
        return Promise.all(deletes).then(() => {
          this.loadUnreadCount();
        });
      })
    );
  }

  notifyBookAdded(bookTitle: string, bookId: string, bookCover?: string): Observable<void> {
    return this.createNotification({
      type: "book_added",
      title: "Livre ajouté ",
      message: `"${bookTitle}" a été ajouté à votre liste de lecture`,
      bookId,
      bookTitle,
      bookCover,
    });
  }

  notifyBookFinished(bookTitle: string, bookId: string, bookCover?: string): Observable<void> {
    return this.createNotification({
      type: "book_finished",
      title: "Livre terminé ",
      message: `Félicitations ! Vous avez terminé "${bookTitle}"`,
      bookId,
      bookTitle,
      bookCover,
    });
  }

  notifyBookFavorite(bookTitle: string, bookId: string, bookCover?: string): Observable<void> {
    return this.createNotification({
      type: "book_favorite",
      title: "Ajouté aux favoris ",
      message: `"${bookTitle}" a été ajouté à vos favoris`,
      bookId,
      bookTitle,
      bookCover,
    });
  }
}