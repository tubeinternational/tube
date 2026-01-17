import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  /**
   * =========================
   * PUBLIC ROUTES (NO LAYOUT)
   * =========================
   */
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  /**
   * =========================
   * APP ROUTES (WITH LAYOUT)
   * =========================
   */
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () =>
          import('./features/videos/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },

      {
        path: 'video/:slug',
        loadComponent: () =>
          import(
            './features/videos/pages/video-watch/video-watch.component'
          ).then((m) => m.VideoWatchComponent),
      },

      {
        path: 'shorts',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/shorts/pages/shorts-feed/shorts-feed.component'
              ).then((m) => m.ShortsFeedComponent),
          },
          {
            path: ':slug',
            loadComponent: () =>
              import(
                './features/shorts/pages/shorts-feed/shorts-feed.component'
              ).then((m) => m.ShortsFeedComponent),
          },
        ],
      },
      {
        path: 'countries',
        loadComponent: () =>
          import('./features/videos/pages/country/country.component').then(
            (m) => m.CountriesComponent
          ),
      },

      /**
       * =========================
       * ADMIN (PROTECTED)
       * =========================
       */
      {
        path: 'content-dashboard-admin',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import(
            './features/admin/pages/admin-videos/admin-videos.component'
          ).then((m) => m.AdminVideosComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/videos/pages/category/category.component').then(
            (m) => m.CategoryComponent
          ),
      },

      /**
       * =========================
       * HELP DESK (SUPPORT)
       * =========================
       */
      {
        path: 'contact-us',
        loadComponent: () =>
          import(
            './features/support/components/contact-us/contact-us.component'
          ).then((m) => m.ContactUsComponent),
      },
      {
        path: 'content-removal-request',
        loadComponent: () =>
          import(
            './features/support/components/content-removal/content-removal.component'
          ).then((m) => m.ContentRemovalComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import(
            './features/support/pages/privacy-policy/privacy-policy.component'
          ).then((m) => m.PrivacyPolicyComponent),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./features/support/pages/about-us/about-us.component').then(
            (m) => m.AboutUsComponent
          ),
      },
    ],
  },

  /**
   * =========================
   * FALLBACK
   * =========================
   */
  {
    path: '**',
    redirectTo: 'home',
  },
];
