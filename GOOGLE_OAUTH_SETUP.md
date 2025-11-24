# Configuração do Google OAuth para FitRank+

## Passo 1: Configurar Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/

2. **Crie um novo projeto (ou selecione existente):**
   - Clique em "Select a project" no topo
   - Clique em "New Project"
   - Nome: `FitRank Plus`
   - Clique em "Create"

3. **Ative a API do Google+:**
   - No menu lateral, vá em **APIs & Services** → **Library**
   - Procure por "Google+ API"
   - Clique e depois clique em "Enable"

## Passo 2: Configurar Tela de Consentimento OAuth

1. **Vá para OAuth consent screen:**
   - No menu lateral: **APIs & Services** → **OAuth consent screen**

2. **Escolha o tipo de usuário:**
   - Selecione **External**
   - Clique em "Create"

3. **Preencha as informações:**
   - App name: `FitRank+`
   - User support email: Seu email
   - Developer contact: Seu email
   - Clique em "Save and Continue"

4. **Scopes:**
   - Clique em "Add or Remove Scopes"
   - Adicione: `.../auth/userinfo.email` e `.../auth/userinfo.profile`
   - Clique em "Update" e depois "Save and Continue"

5. **Test users (opcional para desenvolvimento):**
   - Adicione seu email como test user
   - Clique em "Save and Continue"

## Passo 3: Criar Credenciais OAuth

### Web Client ID

1. **Crie credencial Web:**
   - Vá em **APIs & Services** → **Credentials**
   - Clique em "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `FitRank+ Web`
   - Authorized JavaScript origins:
     - `https://localhost:19006` (para desenvolvimento)
   - Authorized redirect URIs:
     - `https://auth.expo.io/@SEU_USERNAME/fitrank-plus`
     - `https://localhost:19006`
   - Clique em "Create"
   - **COPIE o Client ID** (algo como `123456789-abc...apps.googleusercontent.com`)

### iOS Client ID (opcional - para Expo Go e builds iOS)

1. **Crie credencial iOS:**
   - Clique em "Create Credentials" → "OAuth client ID"
   - Application type: **iOS**
   - Name: `FitRank+ iOS`
   - Bundle ID: `com.fitrankplus.app`
   - Clique em "Create"
   - **COPIE o Client ID**

### Android Client ID (opcional - para Expo Go e builds Android)

1. **Crie credencial Android:**
   - Clique em "Create Credentials" → "OAuth client ID"
   - Application type: **Android**
   - Name: `FitRank+ Android`
   - Package name: `com.fitrankplus.app`
   - SHA-1 certificate fingerprint: 
     - Para desenvolvimento com Expo Go, use: deixe em branco por enquanto
   - Clique em "Create"
   - **COPIE o Client ID**

## Passo 4: Configurar no Replit

Depois de ter os Client IDs, você precisa configurá-los no Replit. Me envie:

1. **Web Client ID** (obrigatório)
2. **iOS Client ID** (opcional)
3. **Android Client ID** (opcional)

Formato:
```
Web Client ID: 123456789-abcdefgh.apps.googleusercontent.com
iOS Client ID: (se tiver)
Android Client ID: (se tiver)
```

## Notas Importantes

- **Para desenvolvimento local:** Você só precisa do Web Client ID
- **Para builds nativos:** Você precisará dos Client IDs específicos de cada plataforma
- **Expo Go:** Funciona melhor com Web Client ID
- **Deep linking:** O scheme `fitrankplus://` já está configurado no app.json

## Problemas Comuns

### "redirect_uri_mismatch"
- Verifique se o redirect URI no Google Console inclui: `https://auth.expo.io/@SEU_USERNAME/fitrank-plus`

### "invalid_client"
- Verifique se copiou o Client ID corretamente
- Certifique-se de que está usando o Web Client ID

### Botão não aparece
- Verifique se as env vars foram configuradas corretamente
- Reinicie o servidor Expo após configurar as variáveis
