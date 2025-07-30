import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserInStorage {
    userId: string;
    email: string;
    displayName: string;
    role: string;
    schoolId: string;
    token?: string;  // Added token to user info
}

export interface LoginInfoInStorage {
    token: string|null;
    success: boolean;
    message: string;
    landingPage: string;
    user?: UserInStorage;
}

@Injectable({ providedIn: 'root' })
export class UserInfoService {
    public currentUserKey = "currentUser";
    public tokenKey = "jwt_token";
    private storage: Storage;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.storage = this.getSafeStorage();
    }

    private getSafeStorage(): Storage {
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage; // Or localStorage if you prefer
        }
        return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            key: () => null,
            length: 0
        } as Storage;
    }

    storeUserInfo(userInfoString: string): void {
        const data = JSON.parse(userInfoString);
        this.storage.setItem(this.currentUserKey, userInfoString);
        // Store token separately if it exists in the response
        if (data.token) {
            this.storeToken(data.token); // Store raw token string
        }
    }

    storeToken(tokenString: string): void {
        // Store in both sessionStorage and localStorage for consistency
        this.storage.setItem(this.tokenKey, tokenString);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, tokenString);
        }
    }

    removeUserInfo(): void {
        this.storage.removeItem(this.currentUserKey);
    }

    removeToken(): void {
        this.storage.removeItem(this.tokenKey);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.tokenKey);
        }
    }

    getUserInfo(): UserInStorage | null {
        try {
            const userInfoString = this.storage.getItem(this.currentUserKey);
            return userInfoString ? JSON.parse(userInfoString) : null;
        } catch {
            return null;
        }
    }

    isLoggedIn(): boolean {
        return !!this.getUserToken() && !this.isTokenExpired();
    }

    getUserName(): string {
        const userObj = this.getUserInfo();
        return userObj ? userObj.displayName : "no-user";
    }

    getUserToken(): string | null {
        try {
            // First try to get from sessionStorage
            let token = this.storage.getItem(this.tokenKey);

            // If not found, try localStorage (for backward compatibility)
            if (!token && isPlatformBrowser(this.platformId)) {
                token = localStorage.getItem(this.tokenKey);
                if (token) {
                    // Migrate to sessionStorage
                    this.storage.setItem(this.tokenKey, token);
                }
            }

            // Return raw token (no JSON parsing needed)
            return token;
        } catch {
            return null;
        }
    }

    getUserRole(): string | null {
        const userObj = this.getUserInfo();
        return userObj ? userObj.role : null;
    }

    getUserSchool(): string | null {
        const userObj = this.getUserInfo();
        return userObj ? userObj.schoolId : null;
    }

    isTokenExpired(): boolean {
        const token = this.getUserToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true; // If we can't parse, assume expired
        }
    }
}
