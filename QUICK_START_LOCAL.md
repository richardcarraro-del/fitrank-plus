# ⚡ QUICK START - Rodar FitRank+ Localmente

## 🎯 OPÇÃO 1: Script Automático (MAIS RÁPIDO)

### **Windows:**
1. Baixe o projeto (ZIP ou Git)
2. Abra o prompt de comando na pasta do projeto
3. Execute:
```cmd
setup-local.bat
```

### **Linux/Mac:**
1. Baixe o projeto (ZIP ou Git)
2. Abra o terminal na pasta do projeto
3. Execute:
```bash
chmod +x setup-local.sh
./setup-local.sh
```

---

## 🎯 OPÇÃO 2: Manual (Passo a Passo)

### **1. Instalar dependências:**
```bash
npm install
```

### **2. Criar arquivo `.env` com:**
```
EXPO_PUBLIC_SUPABASE_URL=https://clwspdnaafuvjdhjhrpn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3NwZG5hYWZ1dmpkaGpocnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDEzMTksImV4cCI6MjA3OTUxNzMxOX0.oeOPYysYYFMmcsmMt8sHiqnEejNtNZ5cJFa48fxXUFg
```

### **3. Iniciar emulador Android Studio ou conectar celular USB**

### **4. Rodar o app:**
```bash
npx expo run:android
```

---

## 📖 GUIA COMPLETO

Leia: **ANDROID_STUDIO_SETUP.md** para instruções detalhadas.

---

## 🆘 PROBLEMAS?

**App crasha ao abrir:**
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis estão corretas
- Veja os logs no terminal

**Erro de compilação:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

**Emulador não aparece:**
```bash
adb devices
```

Se vazio, inicie o emulador no Android Studio primeiro.
