import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../auth/services/auth.service";

export const AuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);
  
    if (authService.isLoggedIn()) {
        return true;
    }
    else {
        return router.navigate(['admin/login']);    
    }
    // else {
    //   const roles = route.data['permittedRoles'] as Array<string>;
    //   const userRole = authService.getUserToken().role;
  
    //   if (roles && !roles.includes(userRole)) {
    //     return router.navigate(['login']);
    //   }
    //   else
    //     return true;
    // }
  
  }


// auth.guard.ts
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../auth/services/auth.service';

// const RETURN_URL_KEY = 'auth.returnUrl';
// const LOGIN_PATH = '/admin/login';

// export const AuthGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
//   const authService = inject(AuthService);

//   if (authService.isLoggedIn()) {
//     return true;
//   }

//   const target = state.url || '/';
// console.log(`AuthGuard: redirecting to ${LOGIN_PATH} with returnUrl=${target}`);
// console.log(`AuthGuard: redirecting to ${LOGIN_PATH} with returnUrl=${target}`);
// console.log(`AuthGuard: redirecting to ${LOGIN_PATH} with returnUrl=${target}`);
// console.log(`AuthGuard: redirecting to ${LOGIN_PATH} with returnUrl=${target}`);
// console.log(`AuthGuard: redirecting to ${LOGIN_PATH} with returnUrl=${target}`);
//   // Store returnUrl for this session (unless it's already the login page)
//   if (!target.startsWith(LOGIN_PATH)) {
//     try { sessionStorage.setItem(RETURN_URL_KEY, target); } catch {}
//   }

//   // IMPORTANT: return UrlTree, do NOT call router.navigate()
//   return router.createUrlTree([LOGIN_PATH], { queryParams: { returnUrl: target } });
// };
