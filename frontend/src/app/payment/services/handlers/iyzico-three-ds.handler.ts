import { Injectable } from '@angular/core';

import { ThreeDSHandler, ThreeDsResultStatus } from '../three-ds.handlers';

@Injectable()
export class IyziCoThreeDsHandler implements ThreeDSHandler {
  canHandle(provider: string): boolean {
    return provider.toLowerCase() === 'iyzico';
  }

  async confirm(): Promise<ThreeDsResultStatus> {
    // IyziCo relies on redirect-based authentication. Backend should orchestrate the redirect.
    // We simply resolve to processing and let pollUntilTerminal follow up.
    console.debug('IyziCo 3DS handler stub invoked. Redirect handled elsewhere.');
    return 'processing';
  }
}
