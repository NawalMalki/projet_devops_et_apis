import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../AuthService/auth.service';

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
    private authService: AuthService
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

  // Inscription avec email et mot de passe
  async onSubmit() {
    if (this.signUpForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { fullName, email, password } = this.signUpForm.value;
        const user = await this.authService.signUpWithEmail(email, password, fullName);

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

  // Connexion avec Google
  async signInWithGoogle() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithGoogle();
        this.successMessage = 'Connexion Google réussie ! Bienvenue ' + (user.displayName || user.email);
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

  // Connexion avec Facebook
  async signInWithFacebook() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithFacebook();
        this.successMessage = 'Connexion Facebook réussie ! Bienvenue ' + (user.displayName || user.email);
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

  // Connexion avec Twitter
  async signInWithTwitter() {
    if (!this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const user = await this.authService.signInWithTwitter();
        this.successMessage = 'Connexion Twitter réussie ! Bienvenue ' + (user.displayName || user.email);
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

  // Gérer les erreurs d'authentification
  private handleAuthError(error: any) {
    console.error('Erreur d\'authentification:', error);

    switch (error.code) {
      case 'auth/email-already-in-use':
        this.errorMessage = 'Cette adresse email est déjà utilisée.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Adresse email invalide.';
        break;
      case 'auth/weak-password':
        this.errorMessage = 'Le mot de passe est trop faible.';
        break;
      case 'auth/popup-closed-by-user':
        this.errorMessage = 'La connexion a été annulée.';
        break;
      case 'auth/account-exists-with-different-credential':
        this.errorMessage = 'Un compte existe déjà avec cette adresse email.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        break;
      default:
        this.errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }
}