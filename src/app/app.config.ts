import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy} from '@angular/common'
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),provideAnimations(),
    {provide:LocationStrategy,useClass:HashLocationStrategy},
    provideRouter(routes), provideHttpClient(
    withFetch()
  )]
};
