$ErrorActionPreference = "Stop"

Write-Host "Building C# backend..." -ForegroundColor Cyan
dotnet build U2.sln -c Release --nologo -v quiet

Write-Host "Starting C# backend..." -ForegroundColor Cyan
# Start backend in a new window so we can see its logs
Start-Process cmd -ArgumentList "/k dotnet run --project src/server/U2.Server.csproj --no-build -c Release -- --network"

Write-Host "Starting Vite client..." -ForegroundColor Cyan
# Start client in a new window using cmd /k to ensure npm.cmd is executed properly and window stays open
Start-Process cmd -ArgumentList "/k npm run dev"

Write-Host "Servers launched in separate windows." -ForegroundColor Green
