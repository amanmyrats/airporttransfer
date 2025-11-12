import { Injectable } from '@angular/core';

import { ThreeDSHandler, ThreeDsResultStatus } from '../three-ds.handlers';

@Injectable()
export class NoopThreeDsHandler implements ThreeDSHandler {
  canHandle(): boolean {
    return true;
  }

  async confirm(): Promise<ThreeDsResultStatus> {
    return 'processing';
  }
}
