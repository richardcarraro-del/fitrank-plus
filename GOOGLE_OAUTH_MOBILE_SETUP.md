# Configuração do Google OAuth para Mobile

Este documento explica como configurar o Google OAuth para funcionar no celular com Expo + Supabase.

## ⚠️ IMPORTANTE: Limitação do Expo Go

**Google OAuth NÃO funciona corretamente no Expo Go** devido às seguintes limitações:

1. Expo Go não permite customizar o URL scheme do app (`fitrankplus://`)
2. Muitos provedores OAuth (incluindo Google) rejeitam URLs com scheme `exp://`
3. Expo Go gera URLs instáveis que mudam conforme o ambiente (IP local, proxy Expo, etc.)

### 🎯 Solução Recomendada: Development Build

Para desenvolver e testar o Google OAuth localmente, você precisa criar um **Development Build**:

```bash
# Instalar expo-dev-client
npx expo install expo-dev-client

# Criar build local para Android
npx expo run:android

# Ou para iOS (requer Mac)
npx expo run:ios
```

O Development Build funciona igual ao Expo Go (hot reload, debugging), mas permite custom URL schemes e funciona perfeitamente com OAuth!

## ✅ Código Implementado

O código móvel já está implementado e pronto! Funciona em Development Builds e apps standalone.

## 📋 Configuração no Supabase Dashboard

### 1. Adicionar Redirect URLs

Vá para o **Supabase Dashboard** → Seu projeto → **Authentication** → **URL Configuration** → **Redirect URLs**

Adicione a seguinte URL:

```
fitrankplus://auth/callback
```

> **Nota:** Esta URL funciona em:
> - ✅ Development Builds (Android/iOS local)
> - ✅ Standalone Builds (produção)
> - ❌ Expo Go (não suportado - use Development Build)

### 2. Configurar Google OAuth Provider

Ainda no Supabase Dashboard:
1. Vá em **Authentication** → **Providers** → **Google**
2. Verifique se está **Enabled**
3. Confirme que o **Web Client ID** e **Client Secret** estão preenchidos (já configurado anteriormente)

## 🧪 Como Testar

### Opção 1: Development Build (Recomendado)

1. **Instalar expo-dev-client** (apenas uma vez):
   ```bash
   npx expo install expo-dev-client
   ```

2. **Criar e rodar o build local:**
   ```bash
   # Para Android
   npx expo run:android
   
   # Para iOS (requer Mac)
   npx expo run:ios
   ```

3. O app abrirá no seu dispositivo/emulador conectado

4. Clique em "Entrar" → "Continuar com Google"

5. O navegador abrirá, faça login com sua conta Google

6. Após aprovação, você será redirecionado automaticamente de volta ao app!

### Opção 2: Standalone Build (Produção)

Para builds de produção:

```bash
# EAS Build (recomendado)
npm install -g eas-cli
eas build --platform android  # ou ios
```

## 🔧 Fluxo Técnico

1. Usuário clica "Continuar com Google"
2. App gera redirect URI: `fitrankplus://auth/callback`
3. Supabase retorna URL de OAuth do Google
4. Expo Web Browser abre o navegador com a URL
5. Usuário faz login e autoriza o app
6. Google redireciona para Supabase: `https://[project].supabase.co/auth/v1/callback`
7. Supabase processa e redireciona para: `fitrankplus://auth/callback?code=...`
8. Sistema operacional abre o app com o deep link
9. Deep link handler captura o código de autorização
10. App troca o código por tokens usando PKCE
11. Supabase cria sessão e carrega perfil do usuário
12. App navega para onboarding ou tela principal

## 🐛 Troubleshooting

### "Login cancelado" ou "Redireciona para localhost:3000"
**Causa:** Você está usando Expo Go, que não suporta Google OAuth

**Solução:**
1. Crie um Development Build:
   ```bash
   npx expo install expo-dev-client
   npx expo run:android  # ou expo run:ios
   ```
2. Teste no Development Build ao invés do Expo Go

### "Redirect URL not allowed"
**Causa:** A URL de redirect não está na whitelist do Supabase

**Solução:**
1. Vá no Supabase Dashboard → Authentication → URL Configuration
2. Adicione: `fitrankplus://auth/callback`
3. Aguarde 1-2 minutos (cache do Supabase)

### "App não abre após login"
**Causa:** Scheme não configurado ou build incorreto

**Solução:**
1. Verifique `app.config.js` - deve ter `scheme: "fitrankplus"`
2. Recrie o build: `npx expo run:android`

### "Session não atualiza"
**Causa:** Deep link handler não está processando

**Solução:**
Verifique os logs para ver se o callback está chegando:
```
[Deep Link] Received URL: fitrankplus://...
[Deep Link] Processing callback...
```

### "Google Login não funciona na web"
✅ Esperado - OAuth mobile é para dispositivos móveis. Para web, implemente separadamente.

## 📱 URLs do Projeto

- **Custom Scheme:** `fitrankplus://`
- **Auth Callback:** `fitrankplus://auth/callback`
- **Bundle ID (iOS):** `com.fitrankplus.app`
- **Package (Android):** `com.fitrankplus.app`

## ✨ Funcionalidades Implementadas

- ✅ OAuth flow com expo-web-browser
- ✅ Deep linking com expo-linking
- ✅ Handler automático de callbacks
- ✅ Tratamento de erros (cancel, dismiss, missing tokens)
- ✅ Criação automática de perfil para novos usuários
- ✅ Navegação pós-login (onboarding ou main screen)

## 📚 Documentação Adicional

- [Supabase Auth with Expo](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)
- [Expo Web Browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
