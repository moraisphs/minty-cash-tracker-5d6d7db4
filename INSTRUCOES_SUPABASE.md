# 🚀 Instruções para Configurar Supabase

## ⚠️ **IMPORTANTE: Dados Devem Ser Salvos no Supabase**

O app está configurado para usar o Supabase, mas precisa das configurações corretas para funcionar.

## 🔧 **Configuração Necessária**

### 1. **Criar Arquivo de Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2lzZW55dmF3amxld2VjZG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzQ4MDAsImV4cCI6MjA1MTU1MDgwMH0.REPLACE_WITH_ACTUAL_KEY
```

### 2. **Configurar Políticas de Segurança no Supabase**

Acesse o painel do Supabase e execute este SQL:

```sql
-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

### 3. **Reiniciar o Projeto**

```bash
npm run dev
```

## 🎯 **Resultado Esperado**

Após a configuração:
- ✅ **Dados salvos no Supabase**
- ✅ **Persistência entre sessões**
- ✅ **Sincronização na nuvem**
- ✅ **Sem erros de autenticação**

## 📱 **Teste**

1. **Configure** as variáveis de ambiente
2. **Execute** o SQL no Supabase
3. **Reinicie** o projeto
4. **Adicione** uma transação
5. **Verifique** no painel do Supabase se os dados foram salvos

## 🔍 **Verificação**

No painel do Supabase, vá para **Table Editor** e verifique se:
- Tabela `categories` tem dados
- Tabela `transactions` tem dados
- Dados são criados quando você adiciona transações

**Após a configuração, os dados serão salvos no Supabase!** 🎉
