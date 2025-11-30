import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Disable prerendering for param routes like /events/:id to avoid build failure
    renderMode: RenderMode.Server
  }
];
