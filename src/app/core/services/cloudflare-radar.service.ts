import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CountryStatus } from '../models';
import { environment } from '../../../environments/environment';

export interface CloudflareSpeedResult {
  clientCountryAlpha2: string;
  clientCountryName: string;
  p50: number;
  p25: number;
  p75: number;
}

@Injectable({ providedIn: 'root' })
export class CloudflareRadarService {
  private http = inject(HttpClient);

  getSpeedByCountry(): Observable<Partial<CountryStatus>[]> {
    if (!environment.cloudflareToken) {
      console.warn('Cloudflare Token ausente. Utilizando dados de velocidade locais apenas.');
      return of([]);
    }

    const url = `${environment.cloudflareBaseUrl}/quality/speed/top/locations?metric=bandwidth&limit=100&dateRange=7d`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${environment.cloudflareToken}`);

    return this.http.get<any>(url, { headers }).pipe(
      map(res => {
        const top0 = res.result?.top_0 || [];
        return top0.map((item: CloudflareSpeedResult) => ({
          code: item.clientCountryAlpha2,
          speed: Math.round(item.p50)
        }));
      }),
      catchError(() => of([]))
    );
  }
}
