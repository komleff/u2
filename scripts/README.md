# U2 Server Automation Scripts

> 📖 **[Русская версия документации](./README.ru.md)** | **[Russian version](./README.ru.md)**

This directory contains automation scripts for starting U2 project servers for online testing.

## Purpose

The scripts automate the launch of the following components:

1. **C# Backend Server** - game server
   - UDP server on port 7777
   - WebSocket relay on port 8080
   
2. **Vite Development Client** - client application  
   - HTTP server on port 5173

## Usage

### Linux / macOS

```bash
./scripts/start-servers.sh
```

The script automatically:
- Checks for required dependencies (.NET SDK, Node.js)
- Validates port availability
- Builds the C# project
- Starts both servers
- Displays connection information
- Waits for Ctrl+C to stop

### Windows

```batch
scripts\start-servers.bat
```

The script will open two separate windows:
- One for the C# backend server
- One for the Vite client server

To stop the servers, close the respective windows or press Ctrl+C in them.

## Requirements

- **.NET 8.0 SDK** or higher
- **Node.js 18** or higher
- **npm** (installed with Node.js)

## Ports

The following ports are used by default:

| Service | Protocol | Port | URL |
|---------|----------|------|-----|
| Backend UDP | UDP | 7777 | localhost:7777 |
| Backend WebSocket | WebSocket | 8080 | ws://localhost:8080/ |
| Client | HTTP | 5173 | http://localhost:5173/ |

## Logs

### Linux / macOS

Logs are saved to the `logs/` directory in the project root:
- Backend: `logs/backend.log`
- Client: `logs/client.log`

**View logs in real-time:**
```bash
# Backend log
tail -f logs/backend.log

# Client log
tail -f logs/client.log
```

### Windows

Logs are displayed directly in the server windows.

## Troubleshooting

### Port Already in Use

If a port is occupied by another process, the script will show an error. Find and stop the process using the port:

**Linux / macOS:**
```bash
# Find the process
lsof -i :7777
lsof -i :8080
lsof -i :5173

# Stop the process
kill -9 <PID>
```

**Windows:**
```batch
# Find the process
netstat -ano | findstr :7777
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Stop the process
taskkill /PID <PID> /F
```

### Backend Server Won't Start

1. Verify .NET 8.0 SDK is installed:
   ```bash
   dotnet --version
   ```

2. Try building the project manually:
   ```bash
   dotnet build U2.sln
   ```

3. Check the logs:
   ```bash
   cat logs/backend.log
   ```

4. Try running the server manually:
   ```bash
   dotnet run --project src/server/U2.Server.csproj -- --network
   ```

### Client Server Won't Start

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Check the logs:
   ```bash
   cat logs/client.log
   ```

3. Try running manually:
   ```bash
   npm run dev
   ```

## Manual Startup

If the automation script doesn't work, you can start the servers manually:

### Backend (in first terminal)

```bash
dotnet run --project src/server/U2.Server.csproj -- --network
```

### Client (in second terminal)

```bash
npm run dev
```

## Additional Information

For more details about the project, see the [main README.md](../README.md) in the repository root.
