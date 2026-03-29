import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { countriesState } from '../../core/state/app.state';

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="h-10 bg-surface-container-lowest border-t border-primary/20 flex items-center z-50 w-full">
      <div class="px-4 h-full flex items-center bg-primary/10 border-r border-primary/30 shrink-0">
        <span class="font-mono text-[10px] font-bold text-primary flex items-center gap-2">
          <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span> ▶ LIVE_TICKER
        </span>
      </div>
      <div class="flex-1 ticker-wrap overflow-hidden whitespace-nowrap h-full flex items-center">
        <div class="ticker-content flex items-center gap-12 font-mono text-[10px]">
          @for (item of [1, 2]; track item) {
            @for (c of countriesState(); track c.code) {
              <span class="uppercase whitespace-nowrap" [ngClass]="{'text-error font-bold': c.status === 'outage', 'text-secondary font-bold': c.status === 'censored', 'text-tertiary font-bold': c.status === 'slow', 'text-outline': c.status === 'normal'}">
                <img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" class="inline w-3.5 h-2.5 mr-1 rounded-[1px] object-cover" alt="flag"> {{ c.name }}: {{ c.speed }} MBPS ({{ c.status === 'outage' ? 'CRITICAL' : c.status === 'censored' ? 'FILTERED' : c.status === 'slow' ? 'SLOW' : 'STABLE' }})
              </span>
            }
          }
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .ticker-wrap { width: 100%; }
    .ticker-content { display: inline-flex; width: max-content; animation: ticker 40s linear infinite; }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    :host { display: block; width: 100%; }
  `]
})
export class TickerComponent {
  countriesState = countriesState;
}
