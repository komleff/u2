@echo off
REM U2 Online Testing Servers Startup Script for Windows
REM This script starts both the C# backend server and the Vite development client
REM for online testing of the U2 project.

setlocal enabledelayedexpansion

title U2 Online Testing - Server Startup

REM Configuration
set BACKEND_PORT_UDP=7777
set BACKEND_PORT_WS=8080
set CLIENT_PORT=5173

echo ================================================================
echo   U2 Online Testing - Server Startup Script
echo ================================================================
echo.

REM Check for required commands
echo Checking prerequisites...

where dotnet >nul 2>nul
if errorlevel 1 (
    echo Error: dotnet CLI not found. Please install .NET 8.0 SDK
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm not found. Please install Node.js ^>=18
    pause
    exit /b 1
)

echo [OK] All prerequisites satisfied
echo.

REM Build the C# solution
echo Building C# backend server...
dotnet build U2.sln -c Release --nologo -v quiet
if errorlevel 1 (
    echo Error: Failed to build backend server
    pause
    exit /b 1
)
echo [OK] Backend built successfully
echo.

REM Start the C# backend server in a new window
echo Starting C# backend server...
start "U2 Backend Server" dotnet run --project src/server/U2.Server.csproj --no-build -c Release -- --network
timeout /t 3 /nobreak >nul
echo [OK] Backend server started
echo   UDP Server: localhost:%BACKEND_PORT_UDP%
echo   WebSocket: ws://localhost:%BACKEND_PORT_WS%/
echo.

REM Start the Vite client server in a new window
echo Starting Vite development client...
start "U2 Client Server" npm run dev
timeout /t 3 /nobreak >nul
echo [OK] Client server started
echo   Client URL: http://localhost:%CLIENT_PORT%/
echo.

REM Display summary
echo ================================================================
echo   Servers are running!
echo ================================================================
echo.
echo Backend Server:
echo   UDP:       localhost:%BACKEND_PORT_UDP%
echo   WebSocket: ws://localhost:%BACKEND_PORT_WS%/
echo.
echo Client:
echo   Browser:   http://localhost:%CLIENT_PORT%/
echo.
echo Both servers are running in separate windows.
echo Close those windows or press Ctrl+C in them to stop the servers.
echo.
echo Press any key to exit this script (servers will keep running)...
pause >nul
