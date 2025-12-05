import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../AuthService/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnDestroy {
  signInForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnDestroy(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Connexion avec Email et Mot de passe
  async onSubmit() {
    if (this.signInForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email, password } = this.signInForm.value;
        const user = await this.authService.signInWithEmail(email, password);
        
        this.successMessage = 'Connexion réussie ! Bienvenue ' + (user.displayName || user.email);
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

  // mot de passe oublié
async forgotPassword() {
  const emailControl = this.signInForm.get('email');

  if (!emailControl || !emailControl.value) {
    this.errorMessage = 'Veuillez entrer votre adresse email pour réinitialiser le mot de passe.';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';

  try {
    await this.authService.sendPasswordReset(emailControl.value);
    this.successMessage = 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.';
  } catch (error: any) {
    console.error('Erreur mot de passe oublié:', error);
    switch (error.code) {
      case 'auth/user-not-found':
        this.errorMessage = 'Aucun compte trouvé avec cette adresse email.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Adresse email invalide.';
        break;
      default:
        this.errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
    }
  } finally {
    this.loading = false;
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

  // Gérer les erreurs d'authentification
  private handleAuthError(error: any) {
    console.error('Erreur d\'authentification:', error);
    
    switch (error.code) {
  case 'auth/user-not-found':
    this.errorMessage = 'Aucun compte trouvé avec cette adresse email.';
    break;
  case 'auth/wrong-password':
    this.errorMessage = 'Mot de passe incorrect.';
    break;
  case 'auth/invalid-credential':
    this.errorMessage = 'Identifiants invalides. Vérifiez votre email et votre mot de passe.';
    break;
  case 'auth/invalid-email':
    this.errorMessage = 'Adresse email invalide.';
    break;
  case 'auth/user-disabled':
    this.errorMessage = 'Ce compte a été désactivé.';
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

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}
