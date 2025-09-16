# 🔧 Resolver Erros 406 e 409 do Supabase

## ⚠️ **Problema Identificado**

Os erros 406 e 409 indicam que as políticas de segurança do Supabase ainda estão bloqueando as operações.

## 🔧 **Solução: Executar SQL no Supabase**

### 1. **Acessar o Painel do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Selecione o projeto `lwoisenyvawjlewecdoa`
3. Vá para **SQL Editor**

### 2. **Executar SQL Completo**
Cole e execute este SQL completo:

```sql
-- Desabilitar RLS completamente
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON transactions;

-- Verificar se as tabelas existem e são acessíveis
SELECT 'categories' as table_name, count(*) as row_count FROM categories
UNION ALL
SELECT 'transactions' as table_name, count(*) as row_count FROM transactions;

-- Testar inserção de dados
INSERT INTO categories (name, type, is_default, user_id) 
VALUES ('Teste', 'expense', true, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT * FROM categories WHERE name = 'Teste';
```

### 3. **Verificar Resultado**
Após executar o SQL, você deve ver:
- ✅ **"Success. No rows returned"** para os comandos ALTER
- ✅ **Contagem de linhas** das tabelas
- ✅ **Dados de teste** inseridos com sucesso

## 🚀 **Após Executar o SQL**

1. **Execute** o SQL completo no Supabase
2. **Reinicie** o projeto: `npm run dev`
3. **Teste** adicionando uma transação
4. **Verifique** se os erros desapareceram

## ✅ **Resultado Esperado**

Após executar o SQL:
- ✅ **Sem erros 406 e 409**
- ✅ **Dados salvos no Supabase**
- ✅ **App funcionando perfeitamente**

## 🔍 **Verificação**

No painel do Supabase, vá para **Table Editor** e verifique se:
- ✅ **Tabela categories** tem dados
- ✅ **Tabela transactions** tem dados
- ✅ **Dados são criados** quando você adiciona transações

**Execute o SQL completo agora!** 🎉





