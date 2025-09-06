# My Cash - Controle Financeiro Pessoal

## 🚀 Funcionalidades

- ✅ **Controle de Receitas e Despesas**: Adicione, edite e exclua transações
- ✅ **Gerenciamento de Categorias**: Crie, edite e exclua categorias personalizadas
- ✅ **Dashboard Interativo**: Visualize saldo, receitas e despesas
- ✅ **Gráficos Financeiros**: Análise visual dos seus gastos
- ✅ **Filtros por Período**: Visualize dados por semana, mês, trimestre ou ano
- ✅ **Relatórios PDF**: Exporte seus dados financeiros
- ✅ **Persistência na Nuvem**: Dados salvos no Supabase e sincronizados
- ✅ **PWA**: Instale como aplicativo no seu dispositivo

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **PWA**: Service Worker + Manifest

## 📱 Como Usar

1. **Acesse o App**: Abra o aplicativo no navegador
2. **Adicione Transações**: Clique em "Adicionar Transação"
3. **Gerencie Categorias**: Use o botão "Gerenciar Categorias"
4. **Visualize Dados**: Explore o dashboard e gráficos
5. **Exporte Relatórios**: Gere PDFs dos seus dados

## 🔧 Configuração para Deploy

### Variáveis de Ambiente Necessárias

Para que os dados sejam persistidos na nuvem, configure as seguintes variáveis no Vercel:

```
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_aqui
```

### Como Obter as Chaves do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto "lwoisenyvawjlewecdoa"
4. Vá para "Settings" > "API"
5. Copie:
   - **Project URL** → use como `VITE_SUPABASE_URL`
   - **anon public** key → use como `VITE_SUPABASE_PUBLISHABLE_KEY`

## 🚀 Deploy no Vercel

1. Configure as variáveis de ambiente no painel do Vercel
2. Faça push das alterações:
```bash
git add .
git commit -m "feat: implement Supabase persistence"
git push
```
3. O Vercel fará o deploy automaticamente
4. Os dados serão persistidos na nuvem e aparecerão em qualquer dispositivo

## 📊 Estrutura do Banco de Dados

O projeto usa as seguintes tabelas no Supabase:

- **transactions**: Armazena todas as transações financeiras
- **categories**: Armazena as categorias de receitas e despesas
- **profiles**: Perfil do usuário (futuro)
- **budgets**: Orçamentos (futuro)
- **financial_goals**: Metas financeiras (futuro)

## 🎯 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Orçamentos e metas financeiras
- [ ] Categorização automática
- [ ] Notificações de gastos
- [ ] Relatórios avançados
- [ ] Integração com bancos

---

## Project info

**URL**: https://lovable.dev/projects/767cd24f-15cb-4c00-ac8a-1597b12b8fb5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/767cd24f-15cb-4c00-ac8a-1597b12b8fb5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/767cd24f-15cb-4c00-ac8a-1597b12b8fb5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
