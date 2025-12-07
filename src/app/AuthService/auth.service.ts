import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signOut,
  updateProfile,
  User,
  sendPasswordResetEmail,
  user
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Observable de l'utilisateur actuel
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Écouter les changements d'état de l'utilisateur
    this.user$ = user(this.auth);
  }

  // ✅ Vérifier si l'utilisateur est connecté et rediriger si non connecté
  checkAuthAndRedirect(): void {
    user(this.auth).subscribe(currentUser => {
      if (!currentUser) {
        console.log('❌ Non connecté, redirection vers sign-in');
        this.router.navigate(['/sign-in']);
      } else {
        console.log('✅ Utilisateur authentifié:', currentUser.email);
      }
    });
  }

  // ✅ Rediriger si déjà connecté (pour sign-in/sign-up)
  redirectIfAuthenticated(): void {
    user(this.auth).subscribe(currentUser => {
      if (currentUser) {
        console.log('✅ Déjà connecté, redirection vers home');
        this.router.navigate(['/home']);
      }
    });
  }

  // ✅ Vérifier si connecté (synchrone)
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // Réinitialisation du mot de passe
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

  // Connexion avec Twitter
  async signInWithTwitter(): Promise<User> {
    const provider = new TwitterAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  // Déconnexion
  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/sign-in']);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}