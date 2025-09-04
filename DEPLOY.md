# 🚀 Deploy Automático no Vercel

## Configuração Automática

### 1. Conectar Repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe o repositório: `moraisphs/minty-cash-tracker-5d6d7db4`
4. Configure as seguintes opções:

### 2. Configurações do Projeto

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Variáveis de Ambiente

Não são necessárias variáveis de ambiente para este projeto.

### 4. Deploy Automático

Após conectar o repositório, o Vercel irá:

✅ **Deploy automático** a cada push na branch `main`
✅ **Preview deployments** para pull requests
✅ **Build otimizado** com Vite
✅ **PWA configurado** com service worker
✅ **Cache otimizado** para assets estáticos

### 5. URLs de Deploy

- **Produção:** `https://minty-cash-tracker-5d6d7db4.vercel.app`
- **Preview:** URLs únicas para cada branch/PR

### 6. Funcionalidades do App

- 📱 **PWA** - Instalável em dispositivos móveis
- 💰 **Controle Financeiro** - Receitas e despesas
- 📊 **Relatórios PDF** - Semanal, mensal, trimestral, anual
- ✏️ **Editar/Excluir** transações
- 📱 **Responsivo** - Mobile e desktop
- 💾 **Armazenamento Local** - IndexedDB

### 7. Comandos Úteis

```bash
# Build local
npm run build

# Preview local
npm run preview

# Deploy manual (se necessário)
npx vercel --prod
```

### 8. Monitoramento

- Acesse o dashboard do Vercel para monitorar:
  - Status dos deploys
  - Performance
  - Logs de build
  - Analytics

## 🎯 Próximos Passos

1. Conecte o repositório no Vercel
2. Configure as opções mencionadas
3. Faça um push para testar o deploy automático
4. Acesse a URL de produção
5. Teste a instalação como PWA no mobile
