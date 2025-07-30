import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/microservec/login.service';
import { UserInfoService } from '../../services/auth/UserInfo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;
  isSubmitted = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private userInfoService: UserInfoService
  ) {
    // Redirect if already logged in
    if (this.userInfoService.isLoggedIn()) {
      this.navigateToLandingPage();
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.credentials.email, this.credentials.password)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.navigateToLandingPage();
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
        }
      });
  }

  private navigateToLandingPage(): void {
    const role = this.userInfoService.getUserRole();
    const landingPage = this.getLandingPage(role);
    this.router.navigate([landingPage]);
  }

  private getLandingPage(role: string | null): string {
    switch (role?.toUpperCase()) {
      case 'SUPERADMIN': return '/admin-dashboard';
      case 'ADMIN': return '/school-dashboard';
      case 'TEACHER': return '/teacher-dashboard';
      case 'STUDENT': return '/student-dashboard';
      default: return this.loginService.landingPage;
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    return error?.message || 'Login failed. Please try again.';
  }
}
