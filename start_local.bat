@echo off
echo 🚀 Запуск системы анализа юридических документов (локальная версия)...

REM Проверяем наличие Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не установлен. Пожалуйста, установите Python и попробуйте снова.
    pause
    exit /b 1
)

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен. Пожалуйста, установите Node.js и попробуйте снова.
    pause
    exit /b 1
)

echo 📦 Установка зависимостей frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей frontend
    pause
    exit /b 1
)

echo 🚀 Запуск сервисов...
echo.

REM Запускаем mock backend в новом окне
start "Mock Backend" cmd /k "cd /d %~dp0 && python mock_backend.py"

REM Ждем немного, чтобы backend запустился
timeout /t 3 /nobreak >nul

REM Запускаем frontend в новом окне
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Ждем запуска frontend
timeout /t 5 /nobreak >nul

echo ✅ Система запущена!
echo.
echo 🌐 Доступные сервисы:
echo    • Frontend: http://localhost:3000
echo    • Mock Backend API: http://localhost:8000
echo    • API Документация: http://localhost:8000/docs (недоступно для mock)
echo.
echo 📝 Тестовые данные для входа:
echo    • Email: test@example.com
echo    • Пароль: password123
echo.
echo 📋 Для остановки закройте окна командной строки
echo 🌐 Автоматическое открытие браузера...
echo.

REM Открываем браузер
start http://localhost:3000

echo 🎉 Готово! Система должна открыться в браузере.
pause

