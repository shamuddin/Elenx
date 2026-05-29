@echo off
echo ==========================================
echo    ELENX: ONE-CLICK LAUNCHER
echo ==========================================
echo.
echo [1/3] Checking environment...
node -e "if(!require('fs').existsSync('.env')) { console.log('Error: .env file missing. Please create one based on .env.example'); process.exit(1); }"

echo [2/3] Building ELENX Ecosystem...
call npx tsc
cd packages/sdk && call npx tsc
cd ../mcp-server && call npx tsc
cd ../..

:: 3. Launch Unified Gateway and Demo
echo [3/3] Launching Unified ELENX Gateway and Live Demo...
echo.
echo 🚀 ELENX Unified Gateway starting at http://localhost:3000
echo ⚙️  Access the Config Wizard at http://localhost:3000/wizard.html
start "" "http://localhost:3000/wizard.html"

:: Run server in background and demo in foreground
start /b node src/server.js
echo.
echo 🛡️  Starting Live Adversarial Proof Suite (CLI)...
echo.
node src/demo.js

echo.
echo ==========================================
echo    DEMO COMPLETE. PORTAL IS STILL LIVE.
echo ==========================================
pause
