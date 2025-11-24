@echo off
echo.
echo 🚀 FitRank+ - Setup Local para Android Studio
echo ==============================================
echo.

REM Verificar Node.js
echo 📦 Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado. Instale em: https://nodejs.org
    pause
    exit /b 1
)
node --version
echo ✅ Node.js instalado
echo.

REM Verificar npm
echo 📦 Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm não encontrado
    pause
    exit /b 1
)
npm --version
echo ✅ npm instalado
echo.

REM Instalar dependências
echo 📥 Instalando dependências...
call npm install
echo ✅ Dependências instaladas
echo.

REM Criar arquivo .env se não existir
if not exist .env (
    echo 📝 Criando arquivo .env...
    (
        echo EXPO_PUBLIC_SUPABASE_URL=https://clwspdnaafuvjdhjhrpn.supabase.co
        echo EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3NwZG5hYWZ1dmpkaGpocnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDEzMTksImV4cCI6MjA3OTUxNzMxOX0.oeOPYysYYFMmcsmMt8sHiqnEejNtNZ5cJFa48fxXUFg
        echo EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=222196005724-hsduk810apqv8425nbmo4g4p5hffsh7e.apps.googleusercontent.com
        echo EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=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
    ) > .env
    echo ✅ Arquivo .env criado
) else (
    echo ℹ️  Arquivo .env já existe
)
echo.

REM Verificar ADB
echo 📱 Verificando ADB (Android Debug Bridge)...
where adb >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ ADB instalado
    echo.
    echo 📱 Dispositivos conectados:
    adb devices
) else (
    echo ⚠️  ADB não encontrado. Instale Android Studio primeiro.
)
echo.

echo ✅ Setup concluído!
echo.
echo 🎯 Próximos passos:
echo 1. Abra Android Studio
echo 2. Inicie um emulador ou conecte um celular via USB
echo 3. Execute: npx expo run:android
echo.
echo 📖 Leia o guia completo em: ANDROID_STUDIO_SETUP.md
echo.
pause
