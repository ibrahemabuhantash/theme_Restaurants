import { Routes } from '@angular/router';

const loadPage = () => import('./pages.component').then(module => module.PagesComponent);

const pages = ['', 'menu', 'about', 'gallery', 'contact', 'reservation', 'cart', 'checkout',
  'login', 'signup', 'forgot-password', 'reset-password', 'profile', 'privacy', 'terms', 'food/:id'];

export const routes: Routes = [
  ...pages.map(path => ({ path, loadComponent: loadPage, pathMatch: 'full' as const })),
  ...pages.map(path => ({ path: `ar${path ? '/' + path : ''}`, loadComponent: loadPage, pathMatch: 'full' as const })),
  { path: '**', loadComponent: loadPage, data: { notFound: true } },
];
