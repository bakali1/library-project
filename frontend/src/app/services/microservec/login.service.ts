import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiRequestService } from '../auth/api/api-request.service';
import { UserInfoService } from '../auth/UserInfo.service';

export interface ApiResponse {
  success: boolean;
  message: string;
  landingPage: string;
  token: string;
  user?: {
    id: number;
    userName: string;
    email: string;
    role: string;
    phone: string;
    schoolId: number;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private _landingPage = '/dashboard';

  constructor(
    private api: ApiRequestService,
    private userInfo: UserInfoService,
    private router: Router
  ) {}

  get landingPage(): string {
    return this._landingPage;
  }

  set landingPage(value: string) {
    if (value && value.startsWith('/')) {
      this._landingPage = value;
    }
  }

  login(email: string, password: string): Observable<ApiResponse> {
    return this.api.post('auth/login', { email, password }).pipe(
      map(response => this.handleSuccess(response)),
      catchError(error => of(this.handleError(error)))
    );
  }

  private handleSuccess(response: any): ApiResponse {
    // Validate response structure
    if (!response || typeof response !== 'object') {
      return this.createErrorResponse('Invalid server response');
    }

    // Convert string success to boolean
    const success = response.success === "true" || response.success === true;

    // Handle error responses from backend
    if (!success) {
      return {
        success: false,
        token: response.token || '',
        message: response.message || response.error || 'Authentication failed',
        landingPage: '/login'
      };
    }

    // Validate and extract user data
    if (!response.user || !response.token) {
      return this.createErrorResponse('Missing required user information');
    }

    const userData = {
      id: response.user.id,
      userName: response.user.userName || '',
      email: response.user.email || '',
      role: response.user.role || '',
      phone: response.user.phone || '',
      schoolId: response.user.schoolId || null
    };

    // Store user info
    this.userInfo.storeUserInfo(JSON.stringify(userData));

    // Store token separately
    if (response.token) {
      this.userInfo.storeToken(response.token);
    }

    // Determine landing page based on role
    const landingPage = this.determineLandingPage(response.user.role);

    return {
      success: true,
      token: response.token,
      message: response.message || 'Login successful',
      landingPage: landingPage,
      user: userData
    };
  }

  private determineLandingPage(role: string): string {
    if (!role) return this.landingPage;

    switch (role.toUpperCase()) {
      case 'SUPERADMIN': return '/dashboard';
      case 'ADMIN': return '/dashboard';
      case 'TEACHER': return '/dashboard';
      case 'STUDENT': return '/dashboard';
      default: return this.landingPage;
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('Login error:', error);
    return {
      success: false,
      token: '',
      message: this.getErrorMessage(error),
      landingPage: '/login'
    };
  }

  private createErrorResponse(message: string): ApiResponse {
    return {
      success: false,
      token: '',
      message,
      landingPage: '/login'
    };
  }

  private getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    // Handle backend error responses with message
    if (error.message) {
      return error.message;
    }

    // Handle HTTP error responses
    if (error.error?.message) {
      return error.error.message;
    }

    // Generic error messages
    return 'Authentication failed. Please try again.';
  }

  logout(options: { navigate?: boolean; redirectUrl?: string } = {}): void {
    const { navigate = true, redirectUrl } = options;

    // Clear user information
    this.userInfo.removeUserInfo();
    this.userInfo.removeToken();

    // Reset landing page
    this.landingPage = '/dashboard';

    // Navigate if requested
    if (navigate) {
      const queryParams = redirectUrl ? { returnUrl: redirectUrl } : undefined;
      this.router.navigate(['/login'], { queryParams });
    }
  }
}
