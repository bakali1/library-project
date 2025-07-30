import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserInfoService } from './UserInfo.service';
import { LoginService } from '../microservec/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private loginService: LoginService,
    private userInfoService: UserInfoService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.userInfoService.getUserInfo();
    if (!currentUser) {
        this.router.navigate(['/login']);
        return false;
    }

    // Check if route requires specific role
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
        this.router.navigate(['/unauthorized']);
        return false;
    }

    return true;
}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  private checkAuthentication(url: string): boolean {
  const isAuthenticated = this.userInfoService.isLoggedIn();
  console.log(`AuthGuard checking access to ${url}, authenticated: ${isAuthenticated}`);

  if (isAuthenticated) {
    return true;
  }

  console.log('AuthGuard: User not authenticated - redirecting to login');
  this.loginService.landingPage = url;
  this.router.navigate(['/login']);
  return false;
}
}
