import { Injectable } from "@angular/core";
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@angular/fire/auth";
import { Router } from "@angular/router"; 
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.currentUser$.asObservable();

  constructor(private auth: Auth, private router: Router) {
    this.initializeAuthState();
  }

  // <CHANGE> Initialize auth state properly
  private initializeAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser$.next(user);
    });
  }


  // Sign in with email and password
  signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log("User signed in with email:", result.user.email);
        this.router.navigate(["/dashboard"]);
        return result;
      })
      .catch((error) => {
        console.error("Email sign in error:", error.message);
        throw error;
      });
  }

  // Sign up with email and password
  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log("User created:", result.user.email);
        this.router.navigate(["/dashboard"]);
        return result;
      })
      .catch((error) => {
        console.error("Sign up error:", error.message);
        throw error;
      });
  }

  // Sign out
  signOutUser(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        console.log("User signed out");
        this.currentUser$.next(null);
        this.router.navigate(["/sign-in"]);
      })
      .catch((error) => {
        console.error("Sign out error:", error.message);
        throw error;
      });
  }


  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }
}