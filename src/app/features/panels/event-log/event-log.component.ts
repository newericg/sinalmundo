import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { eventLog } from '../../../core/state/app.state';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div>
      <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase mb-4">LOG DE EVENTOS</h4>
      <div class="space-y-3">
        @for (e of logs(); track e.id) {
          <div class="flex gap-3 items-start border-l border-white/5 pl-3 relative transition-all">
            <span class="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full" 
                  [ngClass]="{'bg-error': e.type === 'outage', 'bg-secondary': e.type === 'censorship', 'bg-tertiary': e.type === 'slow', 'bg-primary': e.type === 'restored'}"></span>
            <div>
              <div class="font-mono text-[9px] text-outline mb-0.5">{{ e.timestamp | date:'HH:mm:ss' }}</div>
              <p class="text-[10px] leading-relaxed">
                Status: <span [ngClass]="{'text-error': e.type === 'outage', 'text-secondary': e.type === 'censorship', 'text-tertiary': e.type === 'slow', 'text-primary': e.type === 'restored'}" class="font-bold uppercase">{{ e.type }}</span> 
                em <span class="text-white font-bold">{{ e.countryName | uppercase }}</span>.
                <span class="opacity-70">{{ e.message }}</span>
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EventLogComponent {
  logs = eventLog;
}
