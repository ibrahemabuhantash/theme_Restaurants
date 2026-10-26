import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './angular/app.component';
import { routes } from './angular/routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))],
}).catch(error => console.error(error));
