# 🔧 Criar Arquivo .env.local

## ⚠️ **IMPORTANTE: Crie o arquivo manualmente**

Você precisa criar o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

## 📝 **Conteúdo do Arquivo .env.local**

Crie um arquivo chamado `.env.local` na raiz do projeto (mesmo diretório do package.json) com:

```
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2lzZW55dmF3amxld2VjZG9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDAwNCwiZXhwIjoyMDcyMzkwMDA0fQ.M4n--9-GOs08YXFbY8-eOV-OLfQr96XBHoJzmSJaOg4
```

## 📁 **Localização do Arquivo**

```
minty-cash-tracker-5d6d7db4-main/
├── package.json
├── .env.local          ← CRIE ESTE ARQUIVO AQUI
├── src/
├── public/
└── ...
```

## 🚀 **Após Criar o Arquivo**

1. **Salve** o arquivo `.env.local`
2. **Reinicie** o projeto: `npm run dev`
3. **Teste** adicionando uma transação
4. **Verifique** no Supabase se os dados foram salvos

## ✅ **Resultado Esperado**

Após criar o arquivo e reiniciar:
- ✅ **Dados salvos no Supabase**
- ✅ **Persistência entre sessões**
- ✅ **Sincronização na nuvem**

**Crie o arquivo .env.local agora!** 🎉
