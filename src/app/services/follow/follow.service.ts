import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { NotificationService } from '../notification/notification.service';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class FollowService {

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private auth: Auth
  ) {}

  // =====================
  // FOLLOW
  // =====================
  async follow(currentUserId: string, targetUserId: string) {
    const ref = collection(this.firestore, 'follows');

    await addDoc(ref, {
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: new Date()
    });

    // Créer une notification pour l'utilisateur suivi
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        const followerName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Quelqu\'un';
        await this.notificationService.notifyUserFollow(followerName, currentUserId, targetUserId).toPromise();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification de suivi:', error);
      // Ne pas échouer l'opération de suivi si la notification échoue
    }
  }

  // =====================
  // UNFOLLOW
  // =====================
  async unfollow(currentUserId: string, targetUserId: string) {
    const ref = collection(this.firestore, 'follows');
    const q = query(
      ref,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId)
    );

    const snap = await getDocs(q);
    snap.forEach(d => deleteDoc(d.ref));
  }

  // =====================
  // USERS I FOLLOW
  // =====================
  async getFollowing(userId: string): Promise<string[]> {
    const ref = collection(this.firestore, 'follows');
    const q = query(ref, where('followerId', '==', userId));
    const snap = await getDocs(q);

    return snap.docs.map(d => d.data()['followingId']);
  }

  // =====================
  // USERS WHO FOLLOW ME
  // =====================
  async getFollowers(userId: string): Promise<string[]> {
    const ref = collection(this.firestore, 'follows');
    const q = query(ref, where('followingId', '==', userId));
    const snap = await getDocs(q);

    return snap.docs.map(d => d.data()['followerId']);
  }

  // =====================
  // FRIENDS = FOLLOW EACH OTHER
  // =====================
  async getFriends(userId: string): Promise<any[]> {

    const [followingIds, followerIds] = await Promise.all([
      this.getFollowing(userId),
      this.getFollowers(userId)
    ]);

    // intersection
    const friendsIds = followingIds.filter(id =>
      followerIds.includes(id)
    );

    // récupérer infos depuis users
    const friends: any[] = [];

    for (const uid of friendsIds) {
      const userRef = doc(this.firestore, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        friends.push({
          uid,
          ...snap.data()
        });
      }
    }

    return friends;
  }

// =====================
// CHECK IF FOLLOWING
// =====================
async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  const ref = collection(this.firestore, 'follows');
  const q = query(
    ref,
    where('followerId', '==', currentUserId),
    where('followingId', '==', targetUserId)
  );
  
  const snap = await getDocs(q);
  return !snap.empty;
}
}
