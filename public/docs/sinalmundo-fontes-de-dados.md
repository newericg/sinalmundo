# SinalMundo — Fontes de Dados Detalhadas

> Documento técnico completo: de onde vêm os dados, quais endpoints usar,
> como mapear as respostas para o modelo da aplicação, e o que fazer quando falha.

---

## Visão geral — 4 fontes combinadas

| Fonte | Dado | Auth | Custo | Atualização |
|---|---|---|---|---|
| IODA (Georgia Tech) | Quedas ativas por país | ❌ Nenhuma | Gratuito | ~5 min |
| Cloudflare Radar | Velocidade, qualidade, tráfego | ✅ Token gratuito | Gratuito | ~1h |
| OONI Probe | Censura e bloqueios | ❌ Nenhuma | Gratuito | ~24h |
| Freedom House (JSON estático) | Score de liberdade de internet | ❌ Nenhuma | Gratuito | Anual |

---

## 1. IODA — Quedas de Internet

**O que é:** Sistema da Georgia Tech que monitora conectividade em tempo real usando
3 fontes de sinal: BGP (roteamento), Active Probing (pings), e tráfego de darknet.

**Base URL:** `https://api.ioda.inetintel.cc.gatech.edu/v2`
**Autenticação:** Nenhuma. API completamente pública.
**CORS:** Permite requests do browser diretamente.

### Endpoint 1 — Alertas de quedas ativas

```
GET /outages/alerts
  ?from={unix_timestamp}
  &until={unix_timestamp}
  &entityType=country
  &orderBy=score/desc
  &limit=50
```

Exemplo (últimas 6 horas):
```
const now = Math.floor(Date.now() / 1000);
const from = now - 6 * 3600;
GET https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?from=${from}&until=${now}&entityType=country&orderBy=score/desc&limit=50
```

Resposta relevante:
```json
{
  "data": [
    {
      "datasource": "bgp",
      "entity": {
        "code": "IR",
        "name": "Iran",
        "type": "country"
      },
      "time": 1704067200,
      "level": "critical",
      "value": 12,
      "historyValue": 180
    }
  ]
}
```

Mapeamento para `CountryStatus`:
```typescript
// ioda.service.ts
mapAlertToOutage(alert: IodaAlert): Partial<CountryStatus> {
  const dropPercent = alert.historyValue > 0
    ? Math.round((1 - alert.value / alert.historyValue) * 100)
    : 100;

  const uptime = Math.max(0, 100 - dropPercent);

  return {
    code: alert.entity.code,
    name: alert.entity.name,
    status: alert.level === 'critical' ? 'outage' : 'slow',
    uptime,
  };
}
```

Campos importantes da resposta:
- `entity.code` → código ISO do país (ex: "IR", "MM", "KP")
- `entity.name` → nome em inglês (traduzir para PT-BR via mapa local)
- `level` → "critical" | "warning" | "normal"
- `value` → sinal atual (quanto menor, pior)
- `historyValue` → sinal histórico esperado (baseline)
- `datasource` → "bgp" | "ping-slash24" | "merit-nt"

Regra de severidade:
```typescript
function getSeverity(uptime: number): 'critical' | 'high' | 'medium' {
  if (uptime < 80) return 'critical';  // badge CRÍTICO vermelho
  if (uptime < 92) return 'high';      // badge GRAVE laranja
  return 'medium';                      // badge ALERTA amarelo
}
```

### Endpoint 2 — Série temporal por país (gráfico sparkline)

```
GET /signals/raw/country/{countryCode}
  ?from={unix_timestamp}
  &until={unix_timestamp}
  &datasource=bgp,ping-slash24
```

Exemplo para gráfico de 24h do Brasil:
```
const now = Math.floor(Date.now() / 1000);
const from = now - 24 * 3600;
GET https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/BR?from=${from}&until=${now}&datasource=bgp
```

Resposta:
```json
[
  {
    "entityType": "country",
    "entityCode": "BR",
    "datasource": "bgp",
    "from": 1704067200,
    "until": 1704153600,
    "step": 300,
    "values": [4.83, 4.83, 4.80, 4.75, ...]
  }
]
```

Usar `values` como série temporal para o SparklineChartComponent.
Agrupar por hora (média de 12 pontos de 5min = 1 ponto por hora).

### Limitações e fallback IODA
- Pode ter CORS em alguns ambientes → usar proxy Angular (proxy.conf.json) em dev
- Se a API retornar erro 5xx: usar dados do `assets/mock-data.json`
- Rate limit: sem limite documentado, mas evitar mais de 1 req/min por endpoint
- Países sem dados (ex: Coreia do Norte): marcar como `status: 'outage'` com uptime fixo de 55%

---

## 2. Cloudflare Radar — Velocidade e Qualidade

**O que é:** API gratuita da Cloudflare com dados de velocidade, latência, qualidade
de internet por país, baseada em testes do speed.cloudflare.com e dados da rede global.

**Base URL:** `https://api.cloudflare.com/client/v4/radar`
**Autenticação:** Token Bearer gratuito.
**Licença dos dados:** CC BY-NC 4.0 (pode usar, não pode vender os dados brutos)

### Como obter o token (gratuito)
1. Criar conta em cloudflare.com (não precisa de domínio ou cartão)
2. Ir em: My Profile → API Tokens → Create Token
3. Usar template "Read all resources" ou criar custom:
   - Permissão: `Account > Radar > Read`
4. Copiar o token e salvar em `environment.ts` como `cloudflareToken`

### Endpoint 1 — Velocidade por país (principal para o mapa)

```
GET /radar/quality/speed/top/locations
  ?metric=bandwidth
  &limit=100
  &dateRange=7d
```

Header obrigatório:
```
Authorization: Bearer {cloudflareToken}
```

Resposta:
```json
{
  "result": {
    "top_0": [
      {
        "clientCountryAlpha2": "KR",
        "clientCountryName": "South Korea",
        "p50": 261.4,
        "p25": 89.2,
        "p75": 580.1
      }
    ]
  }
}
```

Mapeamento:
```typescript
mapSpeedResult(item: CloudflareSpeedResult): Partial<CountryStatus> {
  return {
    code: item.clientCountryAlpha2,
    speed: Math.round(item.p50),  // usar mediana (p50)
  };
}
```

### Endpoint 2 — Internet Quality Index (IQI) global

```
GET /radar/quality/iqi/summary
  ?metric=bandwidth
  &dateRange=1d
```

Retorna percentis de bandwidth global para o gráfico de instabilidade.

### Endpoint 3 — Tráfego por país (indicador de queda)

```
GET /radar/http/timeseries_groups
  ?location={countryCode}
  &dateRange=1d
  &aggInterval=1h
```

Se o tráfego HTTP de um país cair mais de 30% em relação à hora anterior:
→ marcar como `status: 'slow'` ou `'outage'`

### Limitações e fallback Cloudflare
- Rate limit: 1200 requests/5min por token (mais que suficiente)
- Dados de velocidade são atualizados a cada ~1h (não mudam a cada polling de 60s)
  → Carregar velocidade apenas 1x na inicialização, não no polling
- Se token inválido: mostrar banner de configuração igual ao TMDB no CineMatch
- Países sem dados de velocidade: usar mediana do continente como estimativa

---

## 3. OONI Probe — Censura e Bloqueios

**O que é:** Open Observatory of Network Interference. ONG que coleta medições
de censura de voluntários ao redor do mundo. API completamente pública.

**Base URL:** `https://api.ooni.io/api/v1`
**Autenticação:** Nenhuma.

### Endpoint — Medições de bloqueio por país

```
GET /measurements
  ?probe_cc={countryCode}
  &test_name=web_connectivity
  &anomaly=true
  &since={YYYY-MM-DD}
  &until={YYYY-MM-DD}
  &limit=100
  &order_by=test_start_time
```

Exemplo (bloqueios detectados no Irã nos últimos 7 dias):
```
GET https://api.ooni.io/api/v1/measurements?probe_cc=IR&test_name=web_connectivity&anomaly=true&since=2026-03-22&until=2026-03-29&limit=50
```

Resposta relevante:
```json
{
  "results": [
    {
      "probe_cc": "IR",
      "test_start_time": "2026-03-28T14:22:00Z",
      "scores": {
        "blocking": 0.85,
        "not_blocking": 0.15
      },
      "input": "https://www.instagram.com"
    }
  ]
}
```

Calcular score de censura por país:
```typescript
// Contar medições com anomalia nos últimos 7 dias
// Normalizar para escala 0–5:
function calcCensorshipScore(anomalyCount: number, totalMeasurements: number): number {
  if (totalMeasurements === 0) return 0;
  const ratio = anomalyCount / totalMeasurements;
  if (ratio > 0.8) return 5;
  if (ratio > 0.6) return 4;
  if (ratio > 0.4) return 3;
  if (ratio > 0.2) return 2;
  if (ratio > 0.05) return 1;
  return 0;
}
```

Plataformas bloqueadas mais comuns para exibir na tela de detalhe do país:
```typescript
// Extrair domínios bloqueados do campo "input"
const KNOWN_PLATFORMS: Record<string, string> = {
  'instagram.com': 'Instagram',
  'youtube.com': 'YouTube',
  'twitter.com': 'Twitter/X',
  'facebook.com': 'Facebook',
  'telegram.org': 'Telegram',
  'whatsapp.com': 'WhatsApp',
  'wikipedia.org': 'Wikipedia',
  'vpn': 'VPN',
};
```

### Limitação importante do OONI
- A API pode ser lenta (2–5s). Usar `@defer` no template para esse bloco.
- Dados dependem de voluntários → países com menos voluntários têm dados escassos.
- **Não chamar no polling de 60s.** Carregar apenas ao abrir o detalhe de um país.

---

## 4. Freedom House — Score de Liberdade (JSON estático)

**O que é:** ONG que publica anualmente o relatório "Freedom on the Net" com scores
de 0–100 para cada país (0 = menos livre, 100 = mais livre).

**Por que estático:** Publicado uma vez por ano. Não tem API. Usar o dado mais recente
extraído manualmente e armazenado em `assets/freedom-data.json`.

Fonte para extrair: https://freedomhouse.org/report/freedom-net (relatório 2025)

Formato do arquivo `assets/freedom-data.json`:
```json
[
  { "code": "CN", "score": 9,  "status": "Not Free" },
  { "code": "RU", "score": 21, "status": "Not Free" },
  { "code": "IR", "score": 16, "status": "Not Free" },
  { "code": "KP", "code": "KP", "score": 3,  "status": "Not Free" },
  { "code": "DE", "score": 79, "status": "Free" },
  { "code": "BR", "score": 64, "status": "Free" },
  { "code": "US", "score": 72, "status": "Free" }
]
```

Converter score Freedom House → score de censura da app (0–5):
```typescript
function freedomScoreToCensorship(freedomScore: number): number {
  if (freedomScore <= 15) return 5;  // Not Free — bloqueio severo
  if (freedomScore <= 30) return 4;  // Not Free — bloqueio alto
  if (freedomScore <= 50) return 3;  // Partly Free
  if (freedomScore <= 65) return 2;  // Partly Free — restrições pontuais
  if (freedomScore <= 75) return 1;  // Free — restrições menores
  return 0;                           // Free — sem restrições
}
```

---

## 5. Estratégia de combinação dos dados no serviço

```typescript
// internet-status.service.ts

@Injectable({ providedIn: 'root' })
export class InternetStatusService {
  private ioda = inject(IodaService);
  private cloudflare = inject(CloudflareRadarService);
  private ooni = inject(OoniService);
  private http = inject(HttpClient);

  // Carregamento inicial: todas as fontes em paralelo
  init(): void {
    const freedom$ = this.http.get<FreedomEntry[]>('/assets/freedom-data.json');
    const speed$ = this.cloudflare.getSpeedByCountry();        // 1x só
    const outages$ = this.ioda.getActiveOutages();             // polling 60s

    // Fase 1: carregar dados estáticos imediatamente
    freedom$.pipe(take(1)).subscribe(data => {
      this.applyFreedomData(data);
    });

    // Fase 2: carregar velocidade (1x, demora mais)
    speed$.pipe(take(1)).subscribe(data => {
      this.applySpeedData(data);
    });

    // Fase 3: polling de quedas a cada 60s
    timer(0, 60_000).pipe(
      switchMap(() => outages$),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(outages => {
      this.applyOutageData(outages);
      this.addEventLogEntries(outages);
    });
  }

  // Merge: combina todas as fontes no signal countriesState
  private applyOutageData(outages: IodaOutage[]): void {
    const current = [...countriesState()];
    outages.forEach(outage => {
      const idx = current.findIndex(c => c.code === outage.entity.code);
      if (idx >= 0) {
        current[idx] = {
          ...current[idx],
          status: outage.level === 'critical' ? 'outage' : 'slow',
          uptime: this.calcUptime(outage),
          lastUpdate: new Date(),
        };
      }
    });
    countriesState.set(current);
  }
}
```

---

## 6. Dados mock para desenvolvimento (assets/mock-data.json)

Usar enquanto as APIs não estão configuradas.
O serviço deve detectar automaticamente se está em ambiente de dev
ou se os tokens não estão configurados e cair para os dados mock.

```typescript
// No serviço, antes de chamar APIs reais:
private loadWithFallback<T>(api$: Observable<T>, mockPath: string): Observable<T> {
  return api$.pipe(
    catchError(err => {
      console.warn('API indisponível, usando dados mock:', err.message);
      return this.http.get<T>(mockPath);
    })
  );
}
```

---

## 7. Resumo de configuração no environment.ts

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,

  // Cloudflare Radar — obter em cloudflare.com → API Tokens
  cloudflareToken: '',

  // IODA — sem token necessário
  iodaBaseUrl: 'https://api.ioda.inetintel.cc.gatech.edu/v2',

  // OONI — sem token necessário
  ooniBaseUrl: 'https://api.ooni.io/api/v1',

  // Cloudflare Radar
  cloudflareBaseUrl: 'https://api.cloudflare.com/client/v4/radar',

  // Polling interval em milissegundos
  pollingInterval: 60_000,
};
```

---

## 8. Proxy de desenvolvimento (proxy.conf.json)

Para evitar CORS em desenvolvimento local:

```json
{
  "/ioda-api": {
    "target": "https://api.ioda.inetintel.cc.gatech.edu",
    "changeOrigin": true,
    "pathRewrite": { "^/ioda-api": "/v2" },
    "secure": true,
    "logLevel": "debug"
  },
  "/ooni-api": {
    "target": "https://api.ooni.io",
    "changeOrigin": true,
    "pathRewrite": { "^/ooni-api": "/api/v1" },
    "secure": true
  }
}
```

Adicionar em `angular.json` no serve options:
```json
"proxyConfig": "proxy.conf.json"
```

---

## 9. O que o usuário vê com e sem APIs configuradas

| Situação | Comportamento |
|---|---|
| Sem nenhum token | App funciona com `mock-data.json`, banner info discreto |
| Só com IODA (sem Cloudflare) | Quedas em tempo real ✅, velocidade com dados de 30 dias atrás |
| Com Cloudflare + IODA | Experiência completa ✅ |
| Com todos + OONI | Experiência completa + detalhe de sites bloqueados por país ✅ |
| API offline/erro | Fallback silencioso para mock, sem crash |
