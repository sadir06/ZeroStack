#!/usr/bin/env pwsh

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ZeroStack - Setup & Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host '❌ Node.js is not installed. Please install Node.js v16 or higher.' -ForegroundColor Red
    Write-Host 'Download from: https://nodejs.org/' -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host '❌ Python is not installed. Please install Python 3.8 or higher.' -ForegroundColor Red
    Write-Host 'Download from: https://python.org/' -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

Write-Host ""
Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host '❌ Failed to install Node.js dependencies' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
cd zerostack-frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host '❌ Failed to install frontend dependencies' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}
cd ..

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
cd search_service
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host '❌ Failed to install Python dependencies' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}
cd ..

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host '🚀 You can now run npm run dev to start ZeroStack!' -ForegroundColor Cyan
Write-Host ""

Read-Host 'Press Enter to exit' 