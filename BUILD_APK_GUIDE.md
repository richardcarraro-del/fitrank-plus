# 📱 GUIA: GERAR APK DO FITRANKPLUS

## ✅ PRÉ-REQUISITOS

1. **Conta Expo** (gratuita)
   - Se não tiver, crie em: https://expo.dev/signup
   - Anote seu email e senha

2. **Acesso ao Shell do Replit**
   - Clique no botão "Shell" no lado esquerdo da tela

---

## 🚀 PASSO A PASSO

### **PASSO 1: Fazer Login no Expo**

No Shell do Replit, digite:

```bash
npx eas-cli login
```

**O que vai acontecer:**
- Vai pedir seu **email** → Digite o email da sua conta Expo
- Vai pedir sua **senha** → Digite a senha (não aparece na tela, é normal)
- Se tudo der certo, vai mostrar: "Logged in as seuemail@exemplo.com"

---

### **PASSO 2: Iniciar o Build do APK**

No Shell, digite:

```bash
npx eas-cli build --platform android --profile preview
```

**O que vai acontecer:**
1. O Expo vai perguntar se pode usar suas credenciais → Digite **Y** (yes)
2. Vai começar a fazer upload do código → Aguarde (pode demorar 1-2 minutos)
3. Vai mostrar um link para acompanhar o build
4. O build acontece nos servidores do Expo (5-15 minutos)

**IMPORTANTE:**
- **NÃO FECHE** o terminal enquanto estiver fazendo upload
- Depois que o upload terminar, pode fechar o terminal
- O build continua na nuvem do Expo

---

### **PASSO 3: Acompanhar o Build**

Você pode acompanhar de 2 formas:

**Opção A - No Terminal:**
- Deixe o terminal aberto e aguarde
- Vai mostrar o progresso em tempo real

**Opção B - No Site (RECOMENDADO):**
- Acesse: https://expo.dev/accounts/SEU_USERNAME/projects/fitrank-plus/builds
- Você verá o build em andamento com progresso em %

---

### **PASSO 4: Baixar o APK**

Quando o build terminar (15 minutos aproximadamente):

1. O terminal vai mostrar um link tipo:
   ```
   ✅ Build successful!
   📦 https://expo.dev/artifacts/eas/xxxxx.apk
   ```

2. **Copie esse link** e envie para o seu celular (WhatsApp, email, etc)

3. **No celular:**
   - Abra o link
   - Baixe o arquivo `.apk`
   - Toque no arquivo para instalar
   - Se pedir, ative "Instalar apps desconhecidos" nas configurações

---

## ⚠️ POSSÍVEIS PROBLEMAS

### **Erro: "No project ID configured"**
```bash
npx eas-cli build:configure
```
Depois rode o build novamente.

### **Erro: "Build failed"**
- Verifique os logs no site do Expo
- Geralmente é problema de configuração
- Me chame que eu te ajudo!

### **Celular não instala o APK**
- Vá em: Configurações → Segurança → Instalar apps desconhecidos
- Ative para o navegador/Chrome
- Tente instalar novamente

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Login
npx eas-cli login

# 2. Build
npx eas-cli build --platform android --profile preview

# 3. Aguardar e baixar o APK quando terminar
```

---

## 💡 DICAS

- **Tempo total:** ~15-20 minutos
- **Tamanho do APK:** ~50-80 MB
- **Validade:** O APK não expira, você pode reinstalar quando quiser
- **Updates:** Para atualizar o app, gere um novo APK

---

## 🆘 PRECISA DE AJUDA?

Se tiver qualquer problema, me chame e eu te ajudo! 🚀

**Boa sorte com seu primeiro APK!** 📱✨
