import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryStatus } from '../../../core/models';

@Component({
  selector: 'app-country-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (country()) {
      <div class="absolute w-64 bg-surface-container-highest/90 border border-primary/40 backdrop-blur-xl p-4 z-50 pointer-events-none shadow-2xl" 
           [style.left.px]="x() - 128" 
           [style.top.px]="y() - 170">
        <div class="flex items-center gap-3 mb-3">
          <img [src]="'https://flagcdn.com/w40/' + (country()!.code | lowercase) + '.png'" class="w-8 h-6 rounded-[2px] object-cover shadow-sm border border-white/10" alt="flag">
          <div>
            <div class="text-xs font-bold leading-none">{{ country()!.name | uppercase }}</div>
            <div class="text-[9px] text-outline uppercase font-mono">Region ID: {{ country()!.code }}</div>
          </div>
        </div>
        <div class="space-y-2 border-t border-white/5 pt-3">
          <div class="flex justify-between font-mono text-[10px]">
            <span class="text-outline uppercase">Status</span>
            <span [ngClass]="{'text-error': country()!.status === 'outage', 'text-tertiary': country()!.status === 'slow', 'text-secondary': country()!.status === 'censored', 'text-primary': country()!.status === 'normal'}" class="font-bold tracking-tight uppercase">{{ country()!.status }}</span>
          </div>
          <div class="flex justify-between font-mono text-[10px]">
            <span class="text-outline uppercase">Avg Speed</span>
            <span class="text-white">{{ country()!.speed }} MBPS</span>
          </div>
          <div class="flex justify-between font-mono text-[10px]">
            <span class="text-outline uppercase">Censorship</span>
            <span class="text-secondary">{{ country()!.censorship }}/5</span>
          </div>
          <div class="flex justify-between font-mono text-[10px]">
            <span class="text-outline uppercase">Uptime</span>
            <span class="text-white">{{ country()!.uptime | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>
    }
  `
})
export class CountryTooltipComponent {
  country = input<CountryStatus | null>(null);
  x = input<number>(0);
  y = input<number>(0);
}
