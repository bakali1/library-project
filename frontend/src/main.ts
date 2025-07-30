import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { App } from './app/app';

bootstrapApplication(App, config)
  .catch(err => console.error(err));
