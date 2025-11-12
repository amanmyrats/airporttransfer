import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallbackService {
  TT_ATH_NEW_ORDER_CALLBACK_URL="https://backend.transfertakip.com/api/v1/airporttransferhub/ATHETYXYMD/acceptneworder/"
  TT_ATH_ORDER_CHANGE_CALLBACK_URL="https://backend.transfertakip.com/api/v1/airporttransferhub/ATHETYXYMD/acceptorderchange/"

  constructor(
    private http: HttpClient
  ) { }

  TtAthNewOrderCallback(data: any, isFromDevEnv?: boolean): Observable<any> {
    return this.http.post<any>(
      this.TT_ATH_NEW_ORDER_CALLBACK_URL,
      data,
      this.buildDevEnvParam(isFromDevEnv)
    );
  }

  TtAthOrderChangeCallback(data: any, isFromDevEnv?: boolean) {
    return this.http.post(
      this.TT_ATH_ORDER_CHANGE_CALLBACK_URL,
      data,
      this.buildDevEnvParam(isFromDevEnv)
    );
  }

  private buildDevEnvParam(isFromDevEnv?: boolean) {
    if (typeof isFromDevEnv === 'undefined') {
      return {};
    }

    return {
      params: new HttpParams().set('is_from_dev_env', `${isFromDevEnv}`)
    };
  }
}
