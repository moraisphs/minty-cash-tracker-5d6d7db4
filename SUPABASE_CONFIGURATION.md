# Configuração do Supabase - Guia Completo

## 🚨 Problema Atual

O app está funcionando com **armazenamento local** porque o Supabase não está configurado corretamente. Os erros mostram:

- `401 Unauthorized` - Chave de API inválida
- `42501 Row Level Security` - Políticas de segurança bloqueando operações

## ✅ Solução: Configurar Supabase Corretamente

### 1. **Obter Chaves do Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `lwoisenyvawjlewecdoa`
4. Vá para **Settings** > **API**
5. Copie as seguintes informações:

```
Project URL: https://lwoisenyvawjlewecdoa.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Configurar Variáveis de Ambiente**

#### Para Desenvolvimento Local:
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_real_aqui
```

#### Para Produção (Vercel):
1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em **Settings** > **Environment Variables**
4. Adicione:

```
VITE_SUPABASE_URL = https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = sua_chave_anonima_real_aqui
```

### 3. **Configurar Row Level Security (RLS)**

No painel do Supabase, vá para **Authentication** > **Policies** e desabilite temporariamente o RLS ou crie políticas adequadas:

#### Opção A: Desabilitar RLS (Desenvolvimento)
```sql
-- Desabilitar RLS para desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

#### Opção B: Criar Políticas (Produção)
```sql
-- Permitir operações para usuários autenticados
CREATE POLICY "Enable all operations for authenticated users" ON categories
FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Enable all operations for authenticated users" ON transactions
FOR ALL USING (auth.uid()::text = user_id);
```

### 4. **Verificar Configuração**

Após configurar, o app deve:
- ✅ Carregar categorias do Supabase
- ✅ Salvar dados na nuvem
- ✅ Sincronizar entre dispositivos

## 🔧 **Status Atual**

- **Desenvolvimento**: Funciona com armazenamento local
- **Produção**: Precisa de configuração do Supabase
- **Fallback**: Automático quando Supabase não configurado

## 📱 **Como Testar**

1. **Sem Supabase**: App funciona localmente
2. **Com Supabase**: Dados persistem na nuvem
3. **Deploy**: Configure variáveis no Vercel

## 🎯 **Próximos Passos**

1. Configure as variáveis de ambiente
2. Ajuste as políticas do Supabase
3. Teste a persistência na nuvem
4. Faça deploy no Vercel

---

**Nota**: O app está funcionando perfeitamente com armazenamento local. A configuração do Supabase é opcional para desenvolvimento, mas necessária para persistência na nuvem.
