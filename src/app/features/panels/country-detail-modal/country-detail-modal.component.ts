import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OoniService, BlockedPlatform } from '../../../core/services/ooni.service';
import { countriesState } from '../../../core/state/app.state';

@Component({
  selector: 'app-country-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-auto">
      <div class="relative w-[500px] bg-surface-container border border-primary/20 shadow-2xl flex flex-col overflow-hidden">
        
        <div class="p-5 border-b border-white/5 flex justify-between items-center bg-surface-dim">
          <div class="flex items-center gap-3">
             <img [src]="'https://flagcdn.com/w40/' + (countryCode() | lowercase) + '.png'" class="w-8 h-6 rounded-[2px] object-cover shadow-sm border border-white/10" alt="flag">
             <div>
               <h2 class="font-headline font-bold text-lg text-white leading-none uppercase">{{ countryName() }}</h2>
               <div class="font-mono text-[10px] text-outline tracking-widest uppercase">Detalhes de Rede e Censura</div>
             </div>
          </div>
          <button (click)="close.emit()" class="text-outline hover:text-white transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-6">
           <div class="grid grid-cols-2 gap-4">
              <div class="bg-surface-container-high p-3 border-l-2" [ngClass]="{'border-error': isOutage(), 'border-primary': !isOutage()}">
                <div class="text-[9px] text-outline uppercase font-mono mb-1">Status Backbone (IODA)</div>
                <div class="font-mono text-xl" [ngClass]="{'text-error': isOutage(), 'text-primary': !isOutage()}">{{ status() | uppercase }}</div>
              </div>
              <div class="bg-surface-container-high p-3 border-l-2 border-secondary">
                <div class="text-[9px] text-outline uppercase font-mono mb-1">Índice Base FreedomHouse</div>
                <div class="font-mono text-xl text-secondary">{{ censorship() }}/5</div>
              </div>
           </div>

           <div>
              <h4 class="font-mono text-[10px] text-outline tracking-widest uppercase mb-3 flex items-center gap-2">
                <span class="w-1 h-1 bg-secondary rounded-full animate-pulse"></span> PLATAFORMAS BLOQUEADAS (OONI)
              </h4>
              
              @if (isLoading()) {
                <div class="flex items-center justify-center p-8 bg-surface-container-high border border-white/5">
                   <div class="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full opacity-50"></div>
                </div>
              } @else {
                @if (platforms().length > 0) {
                  <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    @for (p of platforms(); track p.name) {
                      <div class="flex items-center justify-between p-2 bg-surface-container-highest border border-white/5 hover:border-secondary/20 transition-all">
                        <div>
                           <div class="text-xs font-bold text-secondary flex items-center gap-1.5"><span class="w-1 h-1 bg-secondary rounded-full"></span> {{ p.name }}</div>
                           <div class="font-mono text-[9px] text-outline">{{ p.url }}</div>
                        </div>
                        <div class="font-mono text-[9px] text-outline flex items-center gap-1 bg-surface-container-lowest px-1.5 py-0.5 border border-white/5">
                           <span class="material-symbols-outlined text-[10px]">block</span> {{ p.timestamp | date:'shortDate' }}
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-4 border border-white/5 bg-surface-container-low text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-outline mb-1">check_circle</span>
                    <span class="font-mono text-[10px] text-outline">Nenhum evento severo isolado recém reportado.</span>
                  </div>
                }
              }
           </div>
        </div>
      </div>
    </div>
  `
})
export class CountryDetailModalComponent {
  countryCode = input.required<string>();
  close = output<void>();

  private ooni = inject(OoniService);
  
  platforms = signal<BlockedPlatform[]>([]);
  isLoading = signal(true);

  countryName = signal<string>('');
  status = signal<string>('');
  censorship = signal<number>(0);
  isOutage = signal<boolean>(false);

  constructor() {
    effect(() => {
      const code = this.countryCode();
      if (!code) return;
      
      const cData = countriesState().find(c => c.code === code);
      if (cData) {
        this.countryName.set(cData.name);
        this.status.set(cData.status);
        this.censorship.set(cData.censorship);
        this.isOutage.set(cData.status === 'outage');
      }

      this.isLoading.set(true);
      this.platforms.set([]);
      
      this.ooni.getBlockedPlatforms(code).subscribe(res => {
        this.platforms.set(res);
        this.isLoading.set(false);
      });
    });
  }
}
