import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appApplicationConfig } from './app-application.config';
import { serverRoutes } from './app.routes.server';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

const serverConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRouter(routes),
    provideHttpClient()
  ]
};

export const config = mergeApplicationConfig(appApplicationConfig, serverConfig);
