import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // Or use AuthService if you have one

  if (token) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};
