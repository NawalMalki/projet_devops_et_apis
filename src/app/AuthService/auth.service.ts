import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile,
  User,
  sendPasswordResetEmail
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

   async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  // Inscription avec Email et Mot de passe
  async signUpWithEmail(email: string, password: string, fullName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Mettre à jour le profil avec le nom complet
    await updateProfile(userCredential.user, {
      displayName: fullName
    });
    
    return userCredential.user;
  }

  // Connexion avec Email et Mot de passe
  async signInWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  // Connexion avec Google
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  // Connexion avec Facebook
  async signInWithFacebook(): Promise<User> {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  // Déconnexion
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}