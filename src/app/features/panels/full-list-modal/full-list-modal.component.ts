import { Component, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { activeFullModal, countriesState, eventLog } from '../../../core/state/app.state';

@Component({
  selector: 'app-full-list-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  template: `
    <div class="fixed inset-0 z-[100] bg-background/80 backdrop-blur-lg flex items-center justify-center p-8 lg:p-16">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl h-full flex flex-col bg-surface-container border border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden relative" style="animation: dropIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div class="h-16 shrink-0 bg-surface-container-high border-b border-white/5 flex items-center justify-between px-6">
          <div class="flex items-center gap-3">
             <span class="material-symbols-outlined text-primary text-2xl">
                {{ modalType() === 'speed' ? 'speed' : modalType() === 'outages' ? 'public_off' : modalType() === 'censorship' ? 'visibility_off' : 'receipt_long' }}
             </span>
             <h2 class="text-xl font-headline font-bold text-white tracking-widest uppercase">
                Detalhes Detalhados: {{ title() }}
             </h2>
             <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono ml-4">{{ listLength() }} REGISTROS</span>
          </div>

          <button (click)="close()" class="p-2 hover:bg-white/10 rounded-full transition-colors text-outline hover:text-white">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Body Table -->
        <div class="flex-1 overflow-auto custom-scrollbar p-6">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-surface-container z-10 border-b border-white/10">
              <tr class="text-outline uppercase text-[10px] tracking-widest font-mono">
                 <th class="pb-3 px-4 font-normal w-12 text-center">#</th>
                 <th class="pb-3 px-4 font-normal w-12">País</th>
                 <th class="pb-3 px-4 font-normal">Nome</th>
                 
                 @if (modalType() === 'speed') {
                   <th class="pb-3 px-4 font-normal text-right">Download (Mbps)</th>
                   <th class="pb-3 px-4 font-normal text-right">Status</th>
                 }
                 @if (modalType() === 'outages') {
                    <th class="pb-3 px-4 font-normal">Status</th>
                    <th class="pb-3 px-4 font-normal text-right">Sev</th>
                 }
                 @if (modalType() === 'censorship') {
                    <th class="pb-3 px-4 font-normal text-center">Nível (0-6)</th>
                    <th class="pb-3 px-4 font-normal">Sintomas</th>
                 }
                 @if (modalType() === 'logs') {
                    <th class="pb-3 px-4 font-normal">Evento</th>
                    <th class="pb-3 px-4 font-normal text-right">Horário (UTC)</th>
                 }
              </tr>
            </thead>
            <tbody class="font-mono text-sm">
              <!-- SPEED -->
              @if (modalType() === 'speed') {
                @for (item of speedData(); track item.id; let i = $index) {
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <td class="py-4 px-4 text-outline text-center">{{ i + 1 }}</td>
                    <td class="py-4 px-4">
                       <img [src]="'https://flagcdn.com/24x18/' + item.code.toLowerCase() + '.png'" class="w-[24px] h-[18px] object-cover rounded-[2px]" [alt]="item.code">
                    </td>
                    <td class="py-4 px-4 font-bold text-white">{{ item.name }} <span class="text-outline font-normal text-xs ml-2">{{ item.code }}</span></td>
                    <td class="py-4 px-4 text-right text-secondary tabular-nums">{{ item.value | number:'1.2-2' }}</td>
                    <td class="py-4 px-4 text-right">
                       <span class="text-[10px] px-2 py-1 rounded border" [ngClass]="item.value > 120 ? 'bg-primary/10 text-primary border-primary/20' : (item.value > 50 ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error/10 text-error border-error/20')">
                          {{ item.value > 120 ? 'ÓTIMO' : (item.value > 50 ? 'MÉDIO' : 'CRÍTICO') }}
                       </span>
                    </td>
                  </tr>
                }
              }

              <!-- OUTAGES -->
              @if (modalType() === 'outages') {
                @for (item of outageData(); track item.id; let i = $index) {
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <td class="py-4 px-4 text-outline text-center">{{ i + 1 }}</td>
                    <td class="py-4 px-4">
                       <img [src]="'https://flagcdn.com/24x18/' + item.code.toLowerCase() + '.png'" class="w-[24px] h-[18px] object-cover rounded-[2px]" [alt]="item.code">
                    </td>
                    <td class="py-4 px-4 font-bold text-white">{{ item.name }} <span class="text-outline font-normal text-xs ml-2">{{ item.code }}</span></td>
                     <td class="py-4 px-4">
                       <span class="text-[10px] px-2 py-1 rounded bg-error/10 text-error border border-error/20 flex w-fit items-center gap-2">
                         <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                         QUEDA IDENTIFICADA
                       </span>
                     </td>
                     <td class="py-4 px-4 text-right">Alta</td>
                  </tr>
                }
              }

              <!-- CENSORSHIP -->
              @if (modalType() === 'censorship') {
                @for (item of censorshipData(); track item.id; let i = $index) {
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <td class="py-4 px-4 text-outline text-center">{{ i + 1 }}</td>
                    <td class="py-4 px-4">
                       <img [src]="'https://flagcdn.com/24x18/' + item.code.toLowerCase() + '.png'" class="w-[24px] h-[18px] object-cover rounded-[2px]" [alt]="item.code">
                    </td>
                    <td class="py-4 px-4 font-bold text-white">{{ item.name }} <span class="text-outline font-normal text-xs ml-2">{{ item.code }}</span></td>
                     <td class="py-4 px-4 text-center">
                        <div class="flex gap-1 justify-center">
                           @for (b of [1,2,3,4,5,6]; track b) {
                              <div class="h-2 w-4 rounded-sm" [ngClass]="item.value >= b ? (item.value >= 4 ? 'bg-error' : 'bg-secondary') : 'bg-surface-container-highest'"></div>
                           }
                        </div>
                     </td>
                     <td class="py-4 px-4 text-outline text-xs">Acessos restritos detectados na Internet Local</td>
                  </tr>
                }
              }

              <!-- LOGS -->
              @if (modalType() === 'logs') {
                @for (item of logData(); track item.id; let i = $index) {
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <td class="py-4 px-4 text-outline text-center">{{ i + 1 }}</td>
                    <td class="py-4 px-4"></td>
                    <td class="py-4 px-4 font-bold text-white">{{ item.countryName }}</td>
                     <td class="py-4 px-4 flex flex-col gap-1">
                        <span class="font-bold font-body" [ngClass]="{'text-error': item.type === 'outage', 'text-secondary': item.type === 'censorship' || item.type === 'restored', 'text-tertiary': item.type === 'slow'}">{{ item.type | uppercase }}</span>
                        <span class="text-outline text-xs">{{ item.message }}</span>
                     </td>
                     <td class="py-4 px-4 text-right text-secondary tabular-nums">{{ item.timestamp | date:'HH:mm:ss' }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
          
          @if(listLength() === 0) {
             <div class="flex flex-col items-center justify-center p-12 text-outline">
                <span class="material-symbols-outlined text-4xl mb-4 opacity-50">data_alert</span>
                <p class="font-mono text-sm">Nenhum registro encontrado nesta categoria no momento.</p>
             </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes dropIn {
      0% { transform: translateY(40px) scale(0.95); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class FullListModalComponent {
  modalType = activeFullModal;
  
  title = computed(() => {
    switch (this.modalType()) {
      case 'speed': return 'Ranking Global de Velocidades (Cloudflare)';
      case 'outages': return 'Quedas Ativas de Internet (IODA)';
      case 'censorship': return 'Panorama de Censura (Freedom House)';
      case 'logs': return 'Log de Eventos Histórico';
      default: return '';
    }
  });

  speedData = computed(() => countriesState().filter(c => c.speed > 0).sort((a,b) => b.speed - a.speed).map(c => ({ id: c.code, code: c.code, name: c.name, value: c.speed })));
  outageData = computed(() => countriesState().filter(c => c.status === 'outage' || c.status === 'slow').map(c => ({ id: c.code, code: c.code, name: c.name, value: c.status })));
  censorshipData = computed(() => countriesState().filter(c => c.censorship > 0).sort((a,b) => b.censorship - a.censorship).map(c => ({ id: c.code, code: c.code, name: c.name, value: c.censorship })));
  logData = computed(() => eventLog());
  
  listLength = computed(() => {
    if (this.modalType() === 'speed') return this.speedData().length;
    if (this.modalType() === 'outages') return this.outageData().length;
    if (this.modalType() === 'censorship') return this.censorshipData().length;
    if (this.modalType() === 'logs') return this.logData().length;
    return 0;
  });

  close() {
    activeFullModal.set(null);
  }
}
