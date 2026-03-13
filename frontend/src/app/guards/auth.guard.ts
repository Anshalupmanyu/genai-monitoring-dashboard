import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Check role if required by route data
    const expectedRole = route.data['role'];
    if (expectedRole && authService.currentUser()?.role !== expectedRole) {
      // User is logged in but doesn't have the right role
      router.navigate(['/']); // Redirect to dashboard
      return false;
    }
    return true;
  }

  // Not logged in
  router.navigate(['/login']);
  return false;
};
