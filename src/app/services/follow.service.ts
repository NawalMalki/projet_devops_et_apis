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

@Injectable({ providedIn: 'root' })
export class FollowService {

  constructor(private firestore: Firestore) {}

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
}
