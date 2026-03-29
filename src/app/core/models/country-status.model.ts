export interface CountryStatus {
  code: string;
  name: string;
  flag: string;
  speed: number;
  censorship: number;      // 0–5
  status: 'normal' | 'slow' | 'outage' | 'censored';
  uptime: number;          // % nas últimas 24h
  lastUpdate: Date;
}
