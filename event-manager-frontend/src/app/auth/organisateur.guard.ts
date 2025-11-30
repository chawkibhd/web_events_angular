import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const organisateurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  if (!user || user.role !== 'ORGANISATEUR') {
    // pas organisateur → on renvoie vers la page de login
    router.navigate(['/login']);
    return false;
  }

  return true;
};