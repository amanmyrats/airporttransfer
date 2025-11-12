import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

export const browserOnlyGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  return isPlatformBrowser(platformId);
};
