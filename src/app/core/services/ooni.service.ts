import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BlockedPlatform {
  name: string;
  url: string;
  timestamp: string;
}

const KNOWN_PLATFORMS: Record<string, string> = {
  'instagram.com': 'Instagram',
  'youtube.com': 'YouTube',
  'twitter.com': 'X / Twitter',
  'x.com': 'X / Twitter',
  'facebook.com': 'Facebook',
  'telegram.org': 'Telegram',
  'whatsapp.com': 'WhatsApp',
  'wikipedia.org': 'Wikipedia',
  'vpn': 'Serviço VPN',
};

@Injectable({ providedIn: 'root' })
export class OoniService {
  private http = inject(HttpClient);

  getBlockedPlatforms(countryCode: string): Observable<BlockedPlatform[]> {
    const until = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 7);
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const url = `${environment.ooniBaseUrl}/measurements?probe_cc=${countryCode.toUpperCase()}&test_name=web_connectivity&anomaly=true&since=${formatDate(since)}&until=${formatDate(until)}&limit=50&order_by=test_start_time`;

    return this.http.get<{results: any[]}>(url).pipe(
      map(res => {
        const unique = new Map<string, BlockedPlatform>();
        res.results?.forEach(r => {
          const urlStr = r.input || '';
          let name = urlStr;
          
          for (const key in KNOWN_PLATFORMS) {
            if (urlStr.includes(key)) {
              name = KNOWN_PLATFORMS[key];
              break;
            }
          }
          
          if (!unique.has(name) && r.scores?.blocking > 0.5) {
             unique.set(name, { name, url: urlStr, timestamp: r.test_start_time });
          }
        });
        return Array.from(unique.values()).slice(0, 8);
      }),
      catchError(() => of([]))
    );
  }
}
