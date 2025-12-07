import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map(currentUser => {
      if (currentUser) {
        console.log('Utilisateur authentifié, accès autorisé');
        return true;
      } else {
        console.log('Utilisateur non authentifié, redirection vers sign-in');
        router.navigate(['/sign-in']);
        return false;
      }
    })
  );
};

// Guard pour les pages publiques (sign-in, sign-up)
// Redirige vers /home si l'utilisateur est déjà connecté
export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map(currentUser => {
      if (currentUser) {
        console.log('Utilisateur déjà connecté, redirection vers home');
        router.navigate(['/home']);
        return false;
      } else {
        console.log('Page publique accessible');
        return true;
      }
    })
  );
};