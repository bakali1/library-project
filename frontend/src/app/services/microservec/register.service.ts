import { Injectable } from '@angular/core';
import { ApiRequestService } from '../auth/api/api-request.service';
import { UserInfoService } from '../auth/UserInfo.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from './login.service';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  schoolId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private _landingPage = '/register';

  constructor(
    private api: ApiRequestService,
    private userInfo: UserInfoService
  ) {}

  register(registerRequest: RegisterRequest): Observable<ApiResponse> {
    return this.api.post("/auth/register", {
      username: registerRequest.username,
      email: registerRequest.email,
      password: registerRequest.password,
      phone: registerRequest.phone,
      role: registerRequest.role,
      schoolId: registerRequest.schoolId
    }).pipe(
      map(response => this.handleSuccess(response)),
      catchError(error => of(this.handleError(error)))
    );
  }

  private handleSuccess(response: any): ApiResponse {
    // Validate response structure
    if (!response || typeof response !== 'object') {
      return this.createErrorResponse('Invalid server response');
    }

    // Handle error responses
    if (response.error || !response.success) {
      return {
        success: false,
        token: "",
        message: response.message || response.error || 'Registration failed',
        landingPage: '/register'
      };
    }

    // Validate and extract user data
    const userData = {
      id: response.user?.id,
      userName: response.user?.userName || '',
      email: response.user?.email || '',
      role: response.user?.role || '',
      phone: response.user?.phone || '',
      schoolId: response.user?.schoolId || null
    };

    // Validate required fields
    if (!response.token || !userData.id) {
      return this.createErrorResponse('Missing required user information');
    }

    // Store user info and token
    this.userInfo.storeUserInfo(JSON.stringify(userData));
    this.userInfo.storeToken(response.token);

    return {
      success: true,
      token: response.token,
      message: response.message || 'Registration successful',
      landingPage: this.determineLandingPage(userData.role),
      user: userData
    };
  }

  private determineLandingPage(role: string): string {
    if (!role) return this._landingPage;

    switch (role.toUpperCase()) {
      case 'SUPERADMIN': return '/admin-dashboard';
      case 'ADMIN': return '/school-dashboard';
      case 'TEACHER': return '/teacher-dashboard';
      case 'STUDENT': return '/student-dashboard';
      default: return this._landingPage;
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('Registration error:', error);
    return {
      success: false,
      token: "",
      message: this.getErrorMessage(error),
      landingPage: '/register'
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

    // Handle specific error cases
    if (error.status === 400) {
      return 'Invalid registration data. Please check your information.';
    }

    return 'Registration failed. Please try again.';
  }

  private createErrorResponse(message: string): ApiResponse {
    return {
      success: false,
      token: "",
      message,
      landingPage: '/register'
    };
  }
}
