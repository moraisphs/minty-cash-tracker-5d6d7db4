# 🔧 Atualizar Arquivo .env.local

## ⚠️ **IMPORTANTE: Atualize o arquivo .env.local**

Você precisa atualizar o arquivo `.env.local` com a chave real do Supabase.

## 📝 **Conteúdo Correto do Arquivo .env.local**

Substitua o conteúdo atual do arquivo `.env.local` por:

```
VITE_SUPABASE_URL=https://lwoisenyvawjlewecdoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2lzZW55dmF3amxld2VjZG9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDAwNCwiZXhwIjoyMDcyMzkwMDA0fQ.M4n--9-GOs08YXFbY8-eOV-OLfQr96XBHoJzmSJaOg4
```

## 🔍 **Diferença Importante**

**ATUAL (incorreto):**
```
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima_real_aqui
```

**CORRETO:**
```
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2lzZW55dmF3amxld2VjZG9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDAwNCwiZXhwIjoyMDcyMzkwMDA0fQ.M4n--9-GOs08YXFbY8-eOV-OLfQr96XBHoJzmSJaOg4
```

## 🚀 **Após Atualizar**

1. **Salve** o arquivo `.env.local` com a chave correta
2. **Reinicie** o projeto: `npm run dev`
3. **Teste** adicionando uma transação
4. **Verifique** no Supabase se os dados foram salvos

## ✅ **Resultado Esperado**

Após atualizar com a chave correta:
- ✅ **Dados salvos no Supabase**
- ✅ **Persistência entre sessões**
- ✅ **Sincronização na nuvem**

**Atualize o arquivo .env.local agora!** 🎉





