import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { topSpeedCountries, activeFullModal } from '../../../core/state/app.state';

@Component({
  selector: 'app-speed-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase">TOP VELOCIDADES</h4>
        <button (click)="openModal()" class="text-[10px] font-mono text-outline hover:text-white transition-colors cursor-pointer border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">VER MAIS</button>
      </div>
      <div class="space-y-4">
        @for (c of topList() | slice:0:4; track c.code; let i = $index) {
          <div class="group cursor-default">
            <div class="flex justify-between items-center text-[10px] font-mono mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-outline">0{{ i + 1 }}</span>
                <span class="flex items-center gap-1.5"><img [src]="'https://flagcdn.com/w20/' + (c.code | lowercase) + '.png'" class="w-4 h-3 rounded-[1px] object-cover" alt="flag"> {{ c.name | uppercase }}</span>
              </div>
              <span class="text-secondary">{{ c.speed }} Mbps</span>
            </div>
            <div class="h-1 w-full bg-surface-container-highest relative">
              <div class="absolute top-0 left-0 h-full bg-secondary" [style.width.%]="(c.speed / 300) * 100"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SpeedRankingComponent {
  topList = topSpeedCountries;
  
  openModal() {
    activeFullModal.set('speed');
  }
}
