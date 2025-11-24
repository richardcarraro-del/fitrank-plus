# Configuração do Google OAuth para Mobile

Este documento explica como configurar o Google OAuth para funcionar no celular com Expo + Supabase.

## ✅ Código Implementado

O código móvel já está implementado e pronto! Falta apenas configurar os redirect URLs no Supabase.

## 📋 Configuração no Supabase Dashboard

### 1. Adicionar Redirect URLs

Vá para o **Supabase Dashboard** → Seu projeto → **Authentication** → **URL Configuration** → **Redirect URLs**

Adicione as seguintes URLs:

```
fitrankplus://auth/callback
```

**Para desenvolvimento com Expo Go:**
```
exp://192.168.x.x:8081
https://[your-expo-username]-anonymous-8081.exp.direct
```

> **Nota:** Substitua `192.168.x.x` pelo seu IP local (exibido quando rodar `npm run dev`)

### 2. Configurar Google OAuth Provider

Ainda no Supabase Dashboard:
1. Vá em **Authentication** → **Providers** → **Google**
2. Verifique se está **Enabled**
3. Confirme que o **Web Client ID** e **Client Secret** estão preenchidos (já configurado anteriormente)

## 🧪 Como Testar

### Opção 1: Testar no Celular via Expo Go

1. Instale o **Expo Go** no seu celular:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Execute o projeto:
   ```bash
   npm run dev
   ```

3. Escaneie o QR code com:
   - **iOS:** App de câmera nativo
   - **Android:** App Expo Go

4. No app, clique em "Entrar" → "Continuar com Google"

5. O navegador abrirá, faça login com sua conta Google

6. Após aprovação, você será redirecionado de volta ao app automaticamente

### Opção 2: Testar com Build Nativo (Avançado)

Para testar com build nativo (não Expo Go):

```bash
# Android
npx expo run:android

# iOS (requer Mac)
npx expo run:ios
```

## 🔧 Fluxo Técnico

1. Usuário clica "Continuar com Google"
2. App gera redirect URI: `fitrankplus://auth/callback`
3. Supabase retorna URL de OAuth do Google
4. Expo Web Browser abre o navegador com a URL
5. Usuário faz login e autoriza o app
6. Google redireciona para Supabase: `https://[project].supabase.co/auth/v1/callback`
7. Supabase processa e redireciona para: `fitrankplus://auth/callback?access_token=...&refresh_token=...`
8. Sistema operacional abre o app com o deep link
9. Deep link handler captura os tokens
10. Supabase cria sessão e carrega perfil do usuário
11. App navega para onboarding ou tela principal

## 🐛 Troubleshooting

### "Redirect URL not allowed"
✅ Adicione `fitrankplus://auth/callback` aos Redirect URLs no Supabase

### "App não abre após login"
✅ Verifique se o scheme `fitrankplus` está configurado em `app.config.js`

### "Session não atualiza"
✅ O deep link handler está implementado e rodando

### "Google Login não funciona na web preview"
✅ Isso é esperado - Google OAuth mobile é projetado para dispositivos físicos/simuladores

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
