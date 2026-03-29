import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { censoredCountries } from '../../../core/state/app.state';

@Component({
  selector: 'app-censorship-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase mb-3 flex items-center gap-2">
        <span class="w-1 h-1 bg-secondary rounded-full"></span> CENSURA E RESTRIÇÕES
      </h4>
      <div class="space-y-3">
        @for (c of censoredList(); track c.code) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" class="w-4 h-3 rounded-[1px] object-cover shadow-sm" alt="flag">
              <span class="text-[11px] font-bold">{{ c.name | uppercase }}</span>
            </div>
            <div class="flex gap-0.5">
              @for (bar of [1, 2, 3, 4, 5]; track bar) {
                <div class="w-1 h-3" [ngClass]="bar <= c.censorship ? 'bg-secondary' : 'bg-secondary/30'"></div>
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
}
