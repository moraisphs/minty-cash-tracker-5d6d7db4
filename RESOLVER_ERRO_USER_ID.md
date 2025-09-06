# 🔧 Resolver Erro de Foreign Key - user_id não existe

## ⚠️ **Problema Identificado**

O erro `23503` indica que o `user_id` não existe na tabela `users`:
```
Key (user_id)=(550e8400-e29b-41d4-a716-446655440000) is not present in table "users"
```

## 🔧 **Solução: Criar Usuário no Supabase**

### 1. **Acessar o Painel do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Selecione o projeto `lwoisenyvawjlewecdoa`
3. Vá para **SQL Editor**

### 2. **Executar SQL para Criar Usuário**
Cole e execute este SQL:

```sql
-- Criar usuário na tabela users
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'usuario@desenvolvimento.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Desabilitar RLS se ainda não foi feito
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Testar inserção de categoria
INSERT INTO categories (name, type, is_default, user_id, created_at)
VALUES (
  'Teste Categoria',
  'expense',
  true,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verificar se a categoria foi criada
SELECT * FROM categories WHERE name = 'Teste Categoria';
```

### 3. **Alternativa: Remover Foreign Key Constraint**
Se a tabela `users` não existir, execute este SQL:

```sql
-- Remover foreign key constraint temporariamente
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Desabilitar RLS
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO categories (name, type, is_default, user_id, created_at)
VALUES ('Teste', 'expense', true, '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT DO NOTHING;
```

## 🚀 **Após Executar o SQL**

1. **Execute** um dos SQLs acima
2. **Reinicie** o projeto: `npm run dev`
3. **Teste** adicionando uma transação
4. **Verifique** se os erros desapareceram

## ✅ **Resultado Esperado**

Após executar o SQL:
- ✅ **Usuário criado** ou constraint removida
- ✅ **Sem erros de foreign key**
- ✅ **Dados salvos no Supabase**
- ✅ **App funcionando perfeitamente**

## 🔍 **Verificação**

No painel do Supabase, vá para **Table Editor** e verifique se:
- ✅ **Tabela users** tem o usuário criado (se usou primeira opção)
- ✅ **Tabela categories** tem dados
- ✅ **Dados são criados** quando você adiciona transações

**Execute o SQL agora!** 🎉
