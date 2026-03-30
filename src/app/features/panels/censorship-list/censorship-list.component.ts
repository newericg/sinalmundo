import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { censoredCountries, activeFullModal } from '../../../core/state/app.state';

@Component({
  selector: 'app-censorship-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-3 border-b border-secondary/10 pb-2">
        <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase flex items-center gap-2 text-secondary">
          <span class="material-symbols-outlined text-[14px]">visibility_off</span> CENSURA E RESTRIÇÕES
        </h4>
        <button (click)="openModal()" class="text-[10px] font-mono text-outline hover:text-white transition-colors cursor-pointer border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">VER MAIS</button>
      </div>
      <div class="space-y-3">
        @for (c of censoredList() | slice:0:5; track c.code) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" class="w-4 h-3 rounded-[1px] object-cover shadow-sm" alt="flag">
              <span class="text-[11px] font-bold">{{ c.name | uppercase }}</span>
            </div>
            <div class="flex gap-0.5">
              @for (bar of [1, 2, 3, 4, 5]; track bar) {
                <div class="w-1 h-3" [ngClass]="bar <= c.censorship ? 'bg-secondary' : 'bg-surface-container-highest'"></div>
              }
            </div>
          </div>
        } @empty {
          <div class="text-[10px] text-outline font-mono py-2">Sem restrições severas.</div>
        }
      </div>
    </div>
  `
})
export class CensorshipListComponent {
  censoredList = censoredCountries;
  
  openModal() {
    activeFullModal.set('censorship');
  }
}
