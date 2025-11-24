#!/bin/bash

echo "🚀 FitRank+ - Setup Local para Android Studio"
echo "=============================================="
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node --version) instalado"
echo ""

# Verificar npm
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi
echo "✅ npm $(npm --version) instalado"
echo ""

# Instalar dependências
echo "📥 Instalando dependências..."
npm install
echo "✅ Dependências instaladas"
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://clwspdnaafuvjdhjhrpn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3NwZG5hYWZ1dmpkaGpocnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDEzMTksImV4cCI6MjA3OTUxNzMxOX0.oeOPYysYYFMmcsmMt8sHiqnEejNtNZ5cJFa48fxXUFg
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=222196005724-hsduk810apqv8425nbmo4g4p5hffsh7e.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=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
EOF
    echo "✅ Arquivo .env criado"
else
    echo "ℹ️  Arquivo .env já existe"
fi
echo ""

# Verificar ADB
echo "📱 Verificando ADB (Android Debug Bridge)..."
if command -v adb &> /dev/null; then
    echo "✅ ADB instalado"
    echo ""
    echo "📱 Dispositivos conectados:"
    adb devices
else
    echo "⚠️  ADB não encontrado. Instale Android Studio primeiro."
fi
echo ""

echo "✅ Setup concluído!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Abra Android Studio"
echo "2. Inicie um emulador ou conecte um celular via USB"
echo "3. Execute: npx expo run:android"
echo ""
echo "📖 Leia o guia completo em: ANDROID_STUDIO_SETUP.md"
echo ""
