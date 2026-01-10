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
