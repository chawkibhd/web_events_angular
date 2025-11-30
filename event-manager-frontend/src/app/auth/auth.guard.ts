import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  if (!user) {
    // pas connecté → on renvoie vers la page de login
    router.navigate(['/login']);
    return false;
  }

  return true;
};