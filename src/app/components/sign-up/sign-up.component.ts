import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import {  FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import {  Router, RouterModule } from "@angular/router"
import  { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ["./sign-up.component.css"],
})
export class SignUpComponent {
  signUpForm: FormGroup
  showPassword = false
  showConfirmPassword = false
  errorMessage = ""
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.signUpForm = this.fb.group(
      {
        fullName: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }
    return null
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.isLoading = true
      this.errorMessage = ""
      const { email, password, fullName } = this.signUpForm.value

      this.authService
        .signUp(email, password)
        .then(() => {
          this.isLoading = false
          this.router.navigate(["/sign-in"])
        })
        .catch((error) => {
          this.isLoading = false
          this.errorMessage = error.message || "L'inscription a échoué. Veuillez réessayer"
        })
    }
  }



  navigateToSignIn() {
    this.router.navigate(["/sign-in"])
  }
}
