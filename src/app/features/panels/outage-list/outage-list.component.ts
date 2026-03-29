import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { outages } from '../../../core/state/app.state';
import { UptimePipe } from '../../../shared/pipes/uptime.pipe';

@Component({
  selector: 'app-outage-list',
  standalone: true,
  imports: [CommonModule, UptimePipe],
  template: `
    <div>
      <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase mb-3 flex items-center gap-2">
        <span class="w-1 h-1 bg-error rounded-full"></span> QUEDAS DETECTADAS
      </h4>
      <div class="space-y-2">
        @for (c of computedOutages(); track c.code) {
          <div (click)="countrySelected.emit(c.code)" class="p-2 bg-surface-container-high border border-white/5 hover:border-primary/20 transition-all cursor-pointer">
            <div class="flex justify-between items-start mb-1">
              <span class="text-xs font-bold flex items-center gap-1.5"><img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" alt="flag" class="w-4 h-3 rounded-[1px] object-cover"> {{ c.name | uppercase }}</span>
              <span class="bg-error/10 text-error text-[8px] px-1.5 py-0.5 font-bold border border-error/20">{{ c.uptime < 95 ? 'CRÍTICO' : 'ALERTA' }}</span>
            </div>
            <div class="font-mono text-[10px] text-outline flex justify-between">
              <span>↓ {{ c.speed }} Mbps</span>
              <span>uptime {{ c.uptime | uptime }}</span>
            </div>
          </div>
        } @empty {
          <div class="text-[10px] text-outline font-mono p-2">Nenhuma queda crítica detectada.</div>
        }
      </div>
    </div>
  `
})
export class OutageListComponent {
  computedOutages = outages;
  countrySelected = output<string>();
}
