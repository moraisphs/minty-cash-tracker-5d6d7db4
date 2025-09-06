# 🚀 Instruções Completas para Configurar Supabase

## 🎯 **Objetivo**
Configurar o Supabase para que os dados sejam salvos na nuvem e persistam entre sessões.

## 📋 **Passos para Configuração**

### 1. **Criar Arquivo .env.local**
Crie um arquivo chamado `.env.local` na raiz do projeto com:

```
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2lzZW55dmF3amxld2VjZG9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDAwNCwiZXhwIjoyMDcyMzkwMDA0fQ.M4n--9-GOs08YXFbY8-eOV-OLfQr96XBHoJzmSJaOg4
```

### 2. **Configurar Políticas de Segurança no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Selecione o projeto `lwoisenyvawjlewecdoa`
3. Vá para **SQL Editor**
4. Execute este SQL:

```sql
-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

### 3. **Reiniciar o Projeto**
```bash
npm run dev
```

## ✅ **Resultado Esperado**

Após a configuração:
- ✅ **Dados salvos no Supabase**
- ✅ **Persistência entre sessões**
- ✅ **Sincronização na nuvem**
- ✅ **Sem erros de autenticação**

## 🔍 **Verificação**

1. **Adicione** uma transação no app
2. **Verifique** no painel do Supabase se os dados foram salvos
3. **Recarregue** a página e veja se os dados persistem

## 📱 **Teste Final**

1. **Configure** as variáveis de ambiente
2. **Execute** o SQL no Supabase
3. **Reinicie** o projeto
4. **Adicione** uma transação
5. **Verifique** no Supabase se os dados foram salvos

## 🎉 **Status Atual**

- **✅ Código preparado** para usar Supabase
- **⏳ Aguardando** criação do arquivo .env.local
- **⏳ Aguardando** execução do SQL no Supabase

**Após a configuração, os dados serão salvos no Supabase!** 🎉
