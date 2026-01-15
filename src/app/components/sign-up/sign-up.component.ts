import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../AuthService/auth.service';

// 🔥 AJOUT
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnDestroy {
  signUpForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore // 🔥 AJOUT
  ) {
    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnDestroy(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ✅ INSCRIPTION + CRÉATION USER FIRESTORE
  async onSubmit() {
    if (this.signUpForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { fullName, email, password } = this.signUpForm.value;
        const user = await this.authService.signUpWithEmail(email, password, fullName);

        // 🔥 AJOUT CRUCIAL : sauvegarde Firestore
        await setDoc(doc(this.firestore, 'users', user.uid), {
          uid: user.uid,
          displayName: fullName,
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date()
        });

        this.successMessage = 'Inscription réussie ! Bienvenue ' + fullName;
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      } catch (error: any) {
        this.handleAuthError(error);
      } finally {
        this.loading = false;
      }
    }
  }

  async signInWithGoogle() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithGoogle();

        // 🔥 créer user Firestore si inexistant
        await setDoc(doc(this.firestore, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || 'Utilisateur',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date()
        }, { merge: true });

        this.successMessage = 'Connexion Google réussie !';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      } catch (error: any) {
        this.handleAuthError(error);
      } finally {
        this.loading = false;
      }
    }
  }

  async signInWithFacebook() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithFacebook();

        await setDoc(doc(this.firestore, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || 'Utilisateur',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date()
        }, { merge: true });

        this.successMessage = 'Connexion Facebook réussie !';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      } catch (error: any) {
        this.handleAuthError(error);
      } finally {
        this.loading = false;
      }
    }
  }

  async signInWithTwitter() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithTwitter();

        await setDoc(doc(this.firestore, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || 'Utilisateur',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date()
        }, { merge: true });

        this.successMessage = 'Connexion Twitter réussie !';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      } catch (error: any) {
        this.handleAuthError(error);
      } finally {
        this.loading = false;
      }
    }
  }

  private handleAuthError(error: any) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.errorMessage = 'Cette adresse email est déjà utilisée.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Adresse email invalide.';
        break;
      case 'auth/weak-password':
        this.errorMessage = 'Mot de passe trop faible.';
        break;
      default:
        this.errorMessage = error.message || 'Erreur inconnue.';
    }
  }

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }
}
