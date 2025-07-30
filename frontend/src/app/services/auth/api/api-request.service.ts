import { AppConfig } from './../../../app.config';
import { UserInfoService } from './../UserInfo.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'console';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiRequestService {
    constructor(
        private appConfig: AppConfig,
        private http: HttpClient,
        private router: Router,
        private userInfoService: UserInfoService
    ) { }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const token = this.userInfoService.getUserToken();
        if (token) {
            headers = headers.append('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    post(url: string, body: Object): Observable<any> {
        const fullUrl = this.appConfig.getApiUrl(url);
        return this.http.post(fullUrl, JSON.stringify(body), {
            headers: this.getHeaders()
        }).pipe(
            catchError(error => this.handleError(error))
        );
    }
    get(url: string, params?: HttpParams | { [param: string]: string | string[] }): Observable<any> {
    const fullUrl = this.appConfig.getApiUrl(url);

    const options = {
        headers: this.getHeaders(),
        params: params
    };
    return this.http.get(fullUrl, options).pipe(
        catchError(error => this.handleError(error))
    );
    }

    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);

        if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/logout']);
        }

        return throwError(() => ({
            message: error.error?.message || 'An unexpected error occurred',
            status: error.status
        }));
    }
}
