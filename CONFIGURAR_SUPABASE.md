# 🔧 Configurar Supabase para Persistência de Dados

## 🎯 **Objetivo**
Configurar o Supabase para que os dados sejam salvos na nuvem e persistam entre sessões.

## 📋 **Passos para Configuração**

### 1. **Acessar o Painel do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `lwoisenyvawjlewecdoa`

### 2. **Obter as Chaves de API**
1. Vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://lwoisenyvawjlewecdoa.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. **Configurar Variáveis de Ambiente**

#### **Para Desenvolvimento Local:**
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_real_aqui
```

#### **Para Produção (Vercel):**
1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em **Settings** > **Environment Variables**
4. Adicione:
   ```
   VITE_SUPABASE_URL = https://lwoisenyvawjlewecdoa.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = sua_chave_anonima_real_aqui
   ```

### 4. **Configurar Row Level Security (RLS)**

No painel do Supabase, vá para **Authentication** > **Policies** e execute os seguintes comandos SQL:

#### **Desabilitar RLS temporariamente (para desenvolvimento):**
```sql
-- Desabilitar RLS para desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

#### **Ou criar políticas adequadas (para produção):**
```sql
-- Permitir operações para usuários autenticados
CREATE POLICY "Enable all operations for authenticated users" ON categories
FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON transactions
FOR ALL USING (true);
```

### 5. **Verificar Configuração**

Após configurar, o app deve:
- ✅ Carregar categorias do Supabase
- ✅ Salvar dados na nuvem
- ✅ Sincronizar entre dispositivos
- ✅ Persistir dados entre sessões

## 🚀 **Teste da Configuração**

1. **Configure as variáveis de ambiente**
2. **Execute o projeto**: `npm run dev`
3. **Acesse**: `http://localhost:8089/`
4. **Adicione uma transação**
5. **Verifique no Supabase** se os dados foram salvos

## 📱 **Status Atual**

- **✅ Código preparado** para usar Supabase
- **⏳ Aguardando configuração** das variáveis de ambiente
- **⏳ Aguardando configuração** das políticas de segurança

## 🔧 **Próximos Passos**

1. **Configure as variáveis de ambiente** (passo 3)
2. **Configure as políticas de segurança** (passo 4)
3. **Teste a persistência** (passo 5)

**Após a configuração, os dados serão salvos no Supabase!** 🎉
