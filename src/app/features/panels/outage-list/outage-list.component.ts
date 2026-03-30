import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { outages, activeFullModal } from '../../../core/state/app.state';
import { UptimePipe } from '../../../shared/pipes/uptime.pipe';

@Component({
  selector: 'app-outage-list',
  standalone: true,
  imports: [CommonModule, UptimePipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-3 border-b border-error/10 pb-2">
        <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase flex items-center gap-2 text-error">
          <span class="material-symbols-outlined text-[14px]">public_off</span> QUEDAS DETECTADAS
        </h4>
        <button (click)="openModal()" class="text-[10px] font-mono text-outline hover:text-white transition-colors cursor-pointer border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">VER MAIS</button>
      </div>
      <div class="space-y-2">
        @for (c of computedOutages(); track c.code) {
          <div (click)="countrySelected.emit(c.code)" class="p-2 bg-surface-container-high border border-white/5 hover:border-error/20 transition-all cursor-pointer">
            <div class="flex justify-between items-start mb-1">
              <span class="text-[11px] font-bold flex items-center gap-1.5"><img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" alt="flag" class="w-4 h-3 rounded-[1px] object-cover"> {{ c.name | uppercase }}</span>
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

  openModal() {
    activeFullModal.set('outages');
  }
}
