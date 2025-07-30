import { isPlatformBrowser } from "@angular/common";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig = {
  providers: [
    provideAnimations()
  ]
};
@Injectable({ providedIn: 'root' })
export class AppConfig {
    public apiPort = '8080';
    public apiProtocol = 'http';
    public apiHostName = 'localhost';
    public baseApiPath = '';

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.initializeConfig();
    }

    private initializeConfig(): void {
        if (isPlatformBrowser(this.platformId)) {
            const isDev = this.apiHostName === 'localhost';
            this.baseApiPath = isDev
                ? `${this.apiProtocol}://${this.apiHostName}:${this.apiPort}/api/`
                : `${window.location.protocol}//${window.location.hostname}/api/`;
        }
    }

    public getApiUrl(endpoint: string): string {
        const cleanEndpoint = endpoint.replace(/^\//, '');
        return `${this.baseApiPath}${cleanEndpoint}`;
    }
}


