# 🔐 Configurar Políticas de Segurança no Supabase

## ⚠️ **IMPORTANTE: Execute este SQL no Supabase**

Para que os dados sejam salvos corretamente, você precisa executar este SQL no painel do Supabase.

## 🚀 **Passos para Configurar**

### 1. **Acessar o Painel do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `lwoisenyvawjlewecdoa`

### 2. **Executar SQL**
1. Vá para **SQL Editor**
2. Cole o código SQL abaixo
3. Clique em **Run**

## 📝 **Código SQL para Executar**

```sql
-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Verificar se as tabelas existem
SELECT * FROM categories LIMIT 5;
SELECT * FROM transactions LIMIT 5;
```

## ✅ **Resultado Esperado**

Após executar o SQL:
- ✅ **RLS desabilitado** para desenvolvimento
- ✅ **Dados podem ser inseridos** sem autenticação
- ✅ **App funcionará** corretamente

## 🔍 **Verificação**

Após executar o SQL, verifique se:
- ✅ **Sem erros** na execução
- ✅ **Tabelas existem** e são acessíveis
- ✅ **Dados podem ser inseridos** manualmente

## 🚀 **Próximos Passos**

1. **Execute** o SQL no Supabase
2. **Crie** o arquivo `.env.local`
3. **Reinicie** o projeto: `npm run dev`
4. **Teste** adicionando uma transação

**Execute o SQL agora!** 🎉
