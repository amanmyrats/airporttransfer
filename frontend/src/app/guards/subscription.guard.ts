import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../admin/services/user.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  console.log("Calling initGetUserDetail from subscription guard");
  console.log("Calling initGetUserDetail from subscription guard");
  console.log("Calling initGetUserDetail from subscription guard");
  userService.initGetUserDetail();
  return true;
};
