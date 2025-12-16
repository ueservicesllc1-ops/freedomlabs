@echo off
echo 🚀 Instalando aplicaciones de escritorio Freedom Labs...

REM Install Assistant App
echo 📦 Instalando app de ayudantes...
cd assistant-app
if not exist "node_modules" (
    call npm install
    echo ✅ App de ayudantes instalada
) else (
    echo ℹ️  Dependencias ya instaladas
)
cd ..

REM Install Admin App
echo 📦 Instalando app de administrador...
cd admin-app
if not exist "node_modules" (
    call npm install
    echo ✅ App de administrador instalada
) else (
    echo ℹ️  Dependencias ya instaladas
)
cd ..

echo.
echo ✨ Instalación completada!
echo.
echo Para iniciar las apps:
echo   - App de ayudantes: cd assistant-app ^&^& npm start
echo   - App de administrador: cd admin-app ^&^& npm start
echo.
echo ⚠️  IMPORTANTE: Reemplaza los logos en:
echo   - assistant-app/assets/logo.png
echo   - admin-app/assets/logo.png
pause


