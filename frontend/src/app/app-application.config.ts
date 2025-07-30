import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApiRequestService } from './services/auth/api/api-request.service';
import { LoginService } from './services/microservec/login.service';
import { UserInfoService } from './services/auth/UserInfo.service';
import { AppConfig } from './app.config';

export const appApplicationConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideAnimationsAsync(),
    AppConfig,
    ApiRequestService,
    LoginService,
    UserInfoService
  ]
};
