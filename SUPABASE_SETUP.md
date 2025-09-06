# Configuração do Supabase para Persistência de Dados

## Variáveis de Ambiente Necessárias

Para que os dados sejam persistidos na nuvem, você precisa configurar as seguintes variáveis de ambiente:

### 1. Arquivo .env.local (para desenvolvimento local)
```env
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_aqui
```

### 2. Configuração no Vercel (para produção)

1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = sua_chave_anonima_aqui
```

## Como Obter as Chaves do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto "lwoisenyvawjlewecdoa"
4. Vá para "Settings" > "API"
5. Copie:
   - **Project URL** → use como `VITE_SUPABASE_URL`
   - **anon public** key → use como `VITE_SUPABASE_PUBLISHABLE_KEY`

## Funcionalidades Implementadas

✅ **Persistência na Nuvem**: Todos os dados são salvos no Supabase
✅ **Sincronização Automática**: Dados aparecem em qualquer dispositivo
✅ **Autenticação Anônima**: Usuário é criado automaticamente
✅ **Categorias Padrão**: Criadas automaticamente para novos usuários
✅ **Backup Automático**: Dados são mantidos mesmo após deploy

## Estrutura do Banco de Dados

O projeto usa as seguintes tabelas no Supabase:

- **transactions**: Armazena todas as transações financeiras
- **categories**: Armazena as categorias de receitas e despesas
- **profiles**: Perfil do usuário (futuro)
- **budgets**: Orçamentos (futuro)
- **financial_goals**: Metas financeiras (futuro)

## Deploy no Vercel

Após configurar as variáveis de ambiente:

1. Faça commit das alterações:
```bash
git add .
git commit -m "feat: implement Supabase persistence"
git push
```

2. O Vercel fará o deploy automaticamente
3. Os dados serão persistidos na nuvem e aparecerão em qualquer dispositivo
