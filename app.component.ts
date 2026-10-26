import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from './store';
import { ImageComponent } from './shared';

@Component({
  selector: 'manara-root', standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, ImageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly s = inject(Store);
  readonly nav = [['home', '/'], ['menu', '/menu'], ['about', '/about'], ['gallery', '/gallery'], ['contact', '/contact']];
  @ViewChild('drawer') drawer?: ElementRef<HTMLDialogElement>;
  constructor() { this.s.router.events.subscribe(event => { if (event instanceof NavigationEnd) this.drawer?.nativeElement.close(); }); }
  newsletter(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    this.s.submit('newsletter', Object.fromEntries(new FormData(form)) as Record<string, string>);
    form.reset();
  }
}
