import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CountryStatus } from '../models';
import { environment } from '../../../environments/environment';

export interface IodaAlert {
  datasource: string;
  entity: { code: string; name: string; type: string };
  time: number;
  level: string;
  value: number;
  historyValue: number;
}

@Injectable({ providedIn: 'root' })
export class IodaService {
  private http = inject(HttpClient);

  getActiveOutages(): Observable<Partial<CountryStatus>[]> {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 6 * 3600;
    const url = `${environment.iodaBaseUrl}/outages/alerts?from=${from}&until=${now}&entityType=country&orderBy=score/desc&limit=50`;
    
    return this.http.get<{data: IodaAlert[]}>(url).pipe(
      map(res => res.data.map(alert => this.mapAlertToOutage(alert))),
      catchError(() => of([]))
    );
  }

  private mapAlertToOutage(alert: IodaAlert): Partial<CountryStatus> {
    const dropPercent = alert.historyValue > 0
      ? Math.round((1 - (alert.value / alert.historyValue)) * 100)
      : 100;
  
    const uptime = Math.max(0, 100 - dropPercent);
  
    return {
      code: alert.entity.code,
      name: alert.entity.name,
      status: alert.level === 'critical' ? 'outage' : 'slow',
      uptime,
    };
  }
}
