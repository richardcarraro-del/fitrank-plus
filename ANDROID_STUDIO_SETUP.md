# 📱 GUIA: RODAR FITRANKPLUS NO ANDROID STUDIO

## ✅ PRÉ-REQUISITOS

### 1. **Android Studio Instalado**
- Baixe em: https://developer.android.com/studio
- Instale o Android SDK (vem junto)
- Configure um emulador Android ou conecte um celular via USB

### 2. **Node.js**
- Versão 18+ instalada
- Verifique: `node --version`

### 3. **Git** (opcional, mas recomendado)
- Para clonar o projeto

---

## 🚀 PASSO A PASSO

### **PASSO 1: Baixar o Projeto**

**Opção A - Via Git (RECOMENDADO):**
```bash
git clone https://github.com/xinxatop/fitrank-plus.git
cd fitrank-plus
```

**Opção B - Download ZIP:**
1. No Replit, clique em "⋮" (três pontos) → "Download as ZIP"
2. Extraia o ZIP em uma pasta no seu PC
3. Abra o terminal nessa pasta

---

### **PASSO 2: Instalar Dependências**

```bash
npm install
```

Aguarde instalar tudo (2-3 minutos).

---

### **PASSO 3: Criar Arquivo de Variáveis de Ambiente**

Crie um arquivo chamado `.env` na raiz do projeto com este conteúdo:

```env
EXPO_PUBLIC_SUPABASE_URL=https://clwspdnaafuvjdhjhrpn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3NwZG5hYWZ1dmpkaGpocnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDEzMTksImV4cCI6MjA3OTUxNzMxOX0.oeOPYysYYFMmcsmMt8sHiqnEejNtNZ5cJFa48fxXUFg
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=222196005724-hsduk810apqv8425nbmo4g4p5hffsh7e.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=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
```

**IMPORTANTE:** No Windows, use Notepad ou VS Code para criar o arquivo. Salve como `.env` (com o ponto na frente).

---

### **PASSO 4: Configurar Android Studio**

1. **Abra Android Studio**
2. **Configure o AVD Manager (Emulador):**
   - Clique em: `Tools` → `Device Manager`
   - Clique em `Create Device`
   - Escolha: **Pixel 6** (ou qualquer Android moderno)
   - API Level: **API 33** (Android 13) ou superior
   - Clique em `Finish`
   - Clique em `Play` ▶️ para iniciar o emulador

**OU conecte seu celular via USB:**
1. Ative modo desenvolvedor no celular:
   - Vá em: `Configurações` → `Sobre o telefone`
   - Toque 7x em `Número da versão`
2. Ative: `Configurações` → `Opções do desenvolvedor` → `Depuração USB`
3. Conecte o cabo USB
4. Autorize o computador quando aparecer a mensagem

---

### **PASSO 5: Verificar Dispositivos Conectados**

No terminal, rode:
```bash
npx expo run:android --device
```

Você deve ver seu emulador ou celular listado.

---

### **PASSO 6: RODAR O APP!**

```bash
npx expo run:android
```

**O que vai acontecer:**
1. ⏱️ Expo vai compilar o projeto (5-10 minutos na primeira vez)
2. 📱 Vai abrir o Android Studio automaticamente
3. 🚀 Vai instalar o app no emulador/celular
4. 📊 Terminal mostra TODOS os logs em tempo real
5. ✅ App abre automaticamente

---

### **PASSO 7: Ver Logs em Tempo Real**

**No Terminal:**
- Todos os logs aparecem automaticamente
- `console.log()` aparece aqui
- Erros aparecem em vermelho

**No Android Studio:**
1. Clique em `View` → `Tool Windows` → `Logcat`
2. Filtre por: `fitrankplus` ou `ReactNativeJS`
3. Você verá TODOS os logs nativos + JavaScript

---

## 🐛 DEBUGGING

### **Se der erro de compilação:**
```bash
# Limpar cache e rebuildar
cd android
./gradlew clean
cd ..
npx expo run:android
```

### **Se o app crashar:**
1. Olhe os logs no terminal
2. Olhe o Logcat do Android Studio
3. Procure por linhas com `ERROR` ou `FATAL`
4. Me manda print desses erros!

### **Se o emulador estiver lento:**
- Feche outros apps
- Dê mais RAM ao emulador (Android Studio → AVD Manager → Edit → Advanced → RAM)
- Ou use seu celular físico (é mais rápido)

---

## 🔥 COMANDOS ÚTEIS

```bash
# Rodar no Android
npx expo run:android

# Limpar cache
npm run clean

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Ver dispositivos conectados
adb devices

# Ver logs em tempo real
npx react-native log-android
```

---

## 📊 O QUE FAZER QUANDO O APP ABRIR

1. ✅ Veja se abre sem crashar
2. ✅ Teste o Google Login
3. ✅ Complete o onboarding
4. ✅ Teste criar um treino
5. ✅ Veja o ranking
6. 📸 **Se der qualquer erro, copie os logs e me manda!**

---

## 🆘 PRECISA DE AJUDA?

**Erros comuns:**

**"SDK location not found"**
```bash
# Crie o arquivo android/local.properties com:
sdk.dir=C:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk
```

**"INSTALL_FAILED_INSUFFICIENT_STORAGE"**
- Libere espaço no emulador
- Ou use um emulador com mais storage

**"Unable to load script"**
- Verifique se o Metro Bundler está rodando
- Tente: `npx expo start --clear`

---

## 🎯 PRÓXIMOS PASSOS

Depois de testar localmente:
1. 🐛 Corrija os bugs que encontrar
2. 🔄 Rebuilde o APK com as correções
3. 🚀 Publique na Play Store

**BOA SORTE! ME AVISA QUANDO CONSEGUIR RODAR!** 💪
