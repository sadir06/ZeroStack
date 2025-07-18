@echo off
echo.
echo ========================================
echo    ZeroStack - Starting Application
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    echo Download from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.
echo 🚀 Starting ZeroStack...
echo.

npm run dev

pause 