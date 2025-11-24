# Configuração Completa do Supabase + Google OAuth

## 📋 Visão Geral

Este documento contém todas as etapas necessárias para configurar o Supabase como backend do FitRank+ e habilitar Google Sign-In.

**O que já está pronto:**
- ✅ Cliente Supabase configurado (`lib/supabase.ts`)
- ✅ Schema SQL com todas as tabelas (`supabase-schema.sql`)
- ✅ Camada de serviços para CRUD (`lib/supabase-service.ts`)
- ✅ Hook de autenticação com Google OAuth (`hooks/useSupabaseAuth.ts`)
- ✅ Variáveis de ambiente configuradas no Replit Secrets

**O que você precisa fazer:**
1. Executar o SQL para criar as tabelas no Supabase
2. (Opcional) Configurar Google OAuth no Google Cloud Console

---

## 🗄️ PASSO 1: Criar Tabelas no Supabase

### 1.1. Acesse o SQL Editor

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto **fitrank-plus**
3. No menu lateral esquerdo, clique em **SQL Editor**

### 1.2. Execute o Schema SQL

1. Clique em **"New query"** (botão verde no canto superior direito)
2. Abra o arquivo `supabase-schema.sql` neste projeto
3. **Copie TODO o conteúdo** do arquivo (são ~350 linhas)
4. Cole no SQL Editor do Supabase
5. Clique em **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### 1.3. Verifique se deu certo

Você deve ver a mensagem:
```
Success. No rows returned
```

Depois, no menu lateral, clique em **"Table Editor"**. Você deve ver estas tabelas:
- ✅ **profiles** - Dados do perfil dos usuários
- ✅ **workouts** - Treinos realizados
- ✅ **user_stats** - Estatísticas e progressão
- ✅ **achievements** - Conquistas desbloqueadas
- ✅ **academies** - Academias cadastradas (com 5 academias seed)

**✨ Pronto! Seu banco de dados está configurado.**

---

## 🔐 PASSO 2: Configurar Google OAuth (OPCIONAL)

Se você quiser que os usuários façam login com Google, siga os passos abaixo. **Caso contrário, pule para o Passo 3.**

### 2.1. Google Cloud Console

1. **Acesse:** https://console.cloud.google.com/

2. **Crie um projeto:**
   - Clique em "Select a project" (topo da página)
   - Clique em "New Project"
   - Nome: `FitRank Plus`
   - Clique em "Create"

3. **Ative a API Google+:**
   - Menu lateral: **APIs & Services** → **Library**
   - Procure: `Google+ API`
   - Clique em "Enable"

### 2.2. Tela de Consentimento OAuth

1. **Vá para:** Menu lateral → **APIs & Services** → **OAuth consent screen**

2. **Configure:**
   - Tipo: **External**
   - App name: `FitRank+`
   - User support email: [seu email]
   - Developer contact: [seu email]
   - Clique em "Save and Continue"

3. **Scopes:**
   - Clique em "Add or Remove Scopes"
   - Selecione:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Clique em "Update" → "Save and Continue"

4. **Test Users (opcional):**
   - Adicione seu email como test user
   - Clique em "Save and Continue"

### 2.3. Criar Client IDs

#### Web Client ID (OBRIGATÓRIO)

1. **Menu:** **APIs & Services** → **Credentials**
2. Clique em **"Create Credentials"** → **"OAuth client ID"**
3. Configurações:
   - Application type: **Web application**
   - Name: `FitRank+ Web`
   - Authorized JavaScript origins:
     ```
     https://localhost:19006
     ```
   - Authorized redirect URIs:
     ```
     https://auth.expo.io/@SEU_USERNAME_EXPO/fitrank-plus
     https://localhost:19006
     ```
4. Clique em **"Create"**
5. **COPIE o Client ID** (formato: `123456789-abc...apps.googleusercontent.com`)

#### iOS Client ID (Opcional - para builds nativos)

1. Clique em **"Create Credentials"** → **"OAuth client ID"**
2. Configurações:
   - Application type: **iOS**
   - Name: `FitRank+ iOS`
   - Bundle ID: `com.fitrankplus.app`
3. Clique em "Create"
4. **COPIE o Client ID**

#### Android Client ID (Opcional - para builds nativos)

1. Clique em **"Create Credentials"** → **"OAuth client ID"**
2. Configurações:
   - Application type: **Android**
   - Name: `FitRank+ Android`
   - Package name: `com.fitrankplus.app`
   - SHA-1 fingerprint: (deixe em branco por enquanto)
3. Clique em "Create"
4. **COPIE o Client ID**

### 2.4. Configurar Client IDs no Replit

Depois de ter os Client IDs do Google, me envie neste formato:

```
Web Client ID: 123456789-abcdefgh.apps.googleusercontent.com
iOS Client ID: (se tiver)
Android Client ID: (se tiver)
```

Vou configurá-los como secrets seguros no Replit.

---

## 📝 PASSO 3: Teste a Configuração

Depois de executar o SQL, me avise dizendo:

> "Executei o SQL no Supabase. As tabelas foram criadas com sucesso!"

Ou, se tiver algum erro, copie a mensagem de erro e me envie.

---

## 🎯 Próximos Passos

Após você confirmar que o SQL foi executado com sucesso, eu vou:

1. ✅ Integrar o novo sistema de autenticação Supabase no app
2. ✅ Substituir todos os pontos que usam AsyncStorage pelo Supabase
3. ✅ Adicionar o botão "Continuar com Google" na tela de login
4. ✅ Testar login, cadastro e Google Sign-In end-to-end
5. ✅ Atualizar o README com a nova arquitetura

---

## 🐛 Problemas Comuns

### "Row Level Security policy violation"
- Significa que as políticas RLS estão funcionando corretamente
- Verifique se o usuário está autenticado antes de acessar dados

### "relation 'profiles' does not exist"
- Você não executou o SQL no Supabase ainda
- Volte ao Passo 1.2 e execute o schema completo

### Google OAuth: "redirect_uri_mismatch"
- Verifique se adicionou `https://auth.expo.io/@SEU_USERNAME/fitrank-plus` nos redirect URIs
- Substitua `SEU_USERNAME` pelo seu username do Expo

### Google OAuth: "invalid_client"
- Verifique se copiou o **Web Client ID** corretamente
- Certifique-se de usar o Web Client ID, não o iOS/Android

---

## 📚 Referências

- **Supabase Docs:** https://supabase.com/docs
- **Expo Auth Session:** https://docs.expo.dev/versions/latest/sdk/auth-session/
- **Google Cloud Console:** https://console.cloud.google.com/
- **Expo + Supabase Guide:** https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

---

## ✅ Checklist Final

Antes de prosseguir, confirme:

- [ ] Executei o SQL no Supabase SQL Editor
- [ ] Vi a mensagem "Success. No rows returned"
- [ ] Verifiquei que as 5 tabelas foram criadas no Table Editor
- [ ] (Opcional) Configurei Google OAuth e copiei os Client IDs

**Quando tudo estiver pronto, me avise e vou continuar a integração!** 🚀
