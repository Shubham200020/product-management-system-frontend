import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isAuthenticated()) {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = authService.getRole();

    if (!requiredRoles || requiredRoles.includes(userRole)) {
      return true;
    } else {
      // Role not allowed
      router.navigate(['/dashboard']);
      return false;
    }
  } else {
    router.navigate(['/login']);
    return false;
  }
};
