import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { outages, censoredCountries, globalAvgSpeed, countriesState } from '../../../core/state/app.state';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border-b border-white/5 flex-shrink-0">
      <h3 class="font-mono text-[10px] text-outline tracking-widest uppercase mb-4">STATUS GLOBAL</h3>
      <div class="grid grid-cols-1 gap-2">
        <div class="bg-surface-container p-3 border-l-2 border-error">
          <div class="text-[9px] text-outline uppercase font-mono mb-1">Países com Quedas</div>
          <div class="flex items-end justify-between">
            <span class="font-mono text-3xl text-error leading-none">{{ outages().length | number:'2.0-0' }}</span>
          </div>
        </div>
        <div class="bg-surface-container p-3 border-l-2 border-tertiary">
          <div class="text-[9px] text-outline uppercase font-mono mb-1">Velocidade Média</div>
          <div class="flex items-end justify-between">
            <span class="font-mono text-3xl text-tertiary leading-none">{{ globalAvgSpeed() }}</span>
            <span class="text-[9px] text-outline mb-1">Mbps mediano</span>
          </div>
        </div>
        <div class="bg-surface-container p-3 border-l-2 border-primary">
          <div class="text-[9px] text-outline uppercase font-mono mb-1">Países Monitorados</div>
          <div class="flex items-end justify-between">
            <span class="font-mono text-3xl text-primary leading-none">{{ countriesState().length }}</span>
            <span class="text-[9px] text-outline mb-1 opacity-50">v2.4 Radar</span>
          </div>
        </div>
        <div class="bg-surface-container p-3 border-l-2 border-secondary">
          <div class="text-[9px] text-outline uppercase font-mono mb-1">Censura Severa</div>
          <div class="flex items-end justify-between">
            <span class="font-mono text-3xl text-secondary leading-none">{{ censoredCountries().length | number:'2.0-0' }}</span>
            <span class="text-[9px] text-outline mb-1">Restrição severa</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatsPanelComponent {
  outages = outages;
  censoredCountries = censoredCountries;
  globalAvgSpeed = globalAvgSpeed;
  countriesState = countriesState;
}
