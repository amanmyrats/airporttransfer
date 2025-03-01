import { HttpClient } from '@angular/common/http';
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

  TtAthNewOrderCallback(data: any): Observable<any> {
    return this.http.post<any>(this.TT_ATH_NEW_ORDER_CALLBACK_URL, data);
  }

  TtAthOrderChangeCallback(data: any) {
    return this.http.post(this.TT_ATH_ORDER_CHANGE_CALLBACK_URL, data);
  }

}
