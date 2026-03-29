# SinalMundo

Um painel global (Cyber Matrix Edition 21+) de monitoramento em tempo real do status mundial da internet.

## Stack Técnica
- Angular 21 (Standlalone, Control Flow \`@if\`, \`@for\`, \`@defer\`)
- Arquitetura nativa reativa via **Signals** \`signal\`, \`computed\`, \`effect\`
- **Zoneless**: Renderização ultra-otimizada
- Mapa múndi **SVG Puro** interativo sem blibliotecas
- **CSS Grid & Variáveis (Custom Properties)**

## Instalação e Execução

\`\`\`bash
# 1. Clone ou entre na pasta gerada
cd d:/Projetos/Sinalmundo

# 2. Instala dependências
npm install

# 3. Rodar servidor local
npm start
\`\`\`

## APIs Suportadas
Para produção, edite os environment endpoints. A atual aplicação roda a nível simulado utilizando proxies.
Para ligar os providers finais insira tokens gerados no site do [IODA (Caida)](https://ioda.caida.org) e chave JWT no [Cloudflare Radar API](https://radar.cloudflare.com/api).
