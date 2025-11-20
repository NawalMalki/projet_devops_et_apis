import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ["./sign-in.component.css"],
})
export class SignInComponent {
  signInForm: FormGroup
  showPassword = false
  errorMessage = ""
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.signInForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  onSubmit() {
    if (this.signInForm.valid) {
      this.isLoading = true
      this.errorMessage = ""
      const { email, password } = this.signInForm.value

      this.authService
        .signInWithEmail(email, password)
        .then(() => {
          this.isLoading = false
          this.router.navigate(["/home"])
        })
        .catch((error) => {
          this.isLoading = false
          this.errorMessage = error.message || "La connexion a échoué. Veuillez réessayer"
        })
    }
  }



  navigateToSignUp() {
    this.router.navigate(["/sign-up"])
  }
}
