import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider, updateProfile, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private facebookProvider: FacebookAuthProvider;

  constructor(private auth: Auth) {
    this.facebookProvider = new FacebookAuthProvider();
  }

  // Inscription avec email et mot de passe
  async signUpWithEmail(email: string, password: string, fullName: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  // Connexion avec email et mot de passe
  async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  // Authentification avec Facebook
  async signInWithFacebook(): Promise<any> {
    try {
      const result: UserCredential = await signInWithPopup(this.auth, this.facebookProvider);
      console.log('Utilisateur connecté avec Facebook:', result.user);
      return result.user;
    } catch (error) {
      console.error('Erreur lors de la connexion Facebook:', error);
      throw error;
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.auth.currentUser;
  }
}