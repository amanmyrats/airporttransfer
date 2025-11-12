import { Provider } from '@angular/core';

import { THREE_DS_HANDLERS } from './three-ds.handlers';
import { NoopThreeDsHandler } from './handlers/noop-three-ds.handler';
import { StripeThreeDsHandler } from './handlers/stripe-three-ds.handler';
import { IyziCoThreeDsHandler } from './handlers/iyzico-three-ds.handler';

export const threeDsHandlerProviders: Provider[] = [
  { provide: THREE_DS_HANDLERS, useClass: StripeThreeDsHandler, multi: true },
  { provide: THREE_DS_HANDLERS, useClass: IyziCoThreeDsHandler, multi: true },
  { provide: THREE_DS_HANDLERS, useClass: NoopThreeDsHandler, multi: true },
];
