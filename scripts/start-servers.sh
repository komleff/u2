#!/bin/bash

# U2 Online Testing Servers Startup Script
# This script starts both the C# backend server and the Vite development client
# for online testing of the U2 project.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT_UDP=7777
BACKEND_PORT_WS=8080
CLIENT_PORT=5173
LOG_DIR="./logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  U2 Online Testing - Server Startup Script                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use (TCP or UDP)
check_port() {
    local port=$1
    # Try lsof first (most reliable)
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -t >/dev/null 2>&1 ; then
            return 0
        else
            return 1
        fi
    # Fallback to netstat if lsof not available
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            return 0
        else
            return 1
        fi
    # Fallback to ss if neither lsof nor netstat available
    elif command -v ss >/dev/null 2>&1; then
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            return 0
        else
            return 1
        fi
    else
        echo -e "${YELLOW}Warning: Cannot check port availability (lsof, netstat, and ss not found)${NC}"
        return 1
    fi
}

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$CLIENT_PID" ] && kill -0 $CLIENT_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping client server (PID: $CLIENT_PID)...${NC}"
        kill $CLIENT_PID 2>/dev/null || true
    fi
    
    echo -e "${GREEN}Servers stopped successfully${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check for required commands
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}Error: dotnet CLI not found. Please install .NET 8.0 SDK${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm not found. Please install Node.js >=18${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites satisfied${NC}"
echo ""

# Check if ports are available
echo -e "${BLUE}Checking port availability...${NC}"

if check_port $BACKEND_PORT_UDP; then
    echo -e "${RED}Error: Port $BACKEND_PORT_UDP is already in use${NC}"
    exit 1
fi

if check_port $BACKEND_PORT_WS; then
    echo -e "${RED}Error: Port $BACKEND_PORT_WS is already in use${NC}"
    exit 1
fi

if check_port $CLIENT_PORT; then
    echo -e "${RED}Error: Port $CLIENT_PORT is already in use${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All ports available${NC}"
echo ""

# Build the C# solution
echo -e "${BLUE}Building C# backend server...${NC}"
if dotnet build U2.sln -c Release --nologo -v quiet; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}Error: Failed to build backend server${NC}"
    exit 1
fi
echo ""

# Start the C# backend server
echo -e "${BLUE}Starting C# backend server...${NC}"
dotnet run --project src/server/U2.Server.csproj --no-build -c Release -- --network > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait a moment for the server to start
sleep 2

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Backend server failed to start${NC}"
    echo -e "${YELLOW}Log output:${NC}"
    cat "$LOG_DIR/backend.log"
    exit 1
fi

echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
echo -e "  ${GREEN}UDP Server: localhost:$BACKEND_PORT_UDP${NC}"
echo -e "  ${GREEN}WebSocket: ws://localhost:$BACKEND_PORT_WS/${NC}"
echo ""

# Start the Vite client server
echo -e "${BLUE}Starting Vite development client...${NC}"
npm run dev > "$LOG_DIR/client.log" 2>&1 &
CLIENT_PID=$!

# Wait a moment for the client to start
sleep 3

# Check if client is still running
if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo -e "${RED}Error: Client server failed to start${NC}"
    echo -e "${YELLOW}Log output:${NC}"
    cat "$LOG_DIR/client.log"
    exit 1
fi

echo -e "${GREEN}✓ Client server started (PID: $CLIENT_PID)${NC}"
echo -e "  ${GREEN}Client URL: http://localhost:$CLIENT_PORT/${NC}"
echo ""

# Display summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Servers are running!                                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend Server:${NC}"
echo -e "  UDP:       localhost:${BACKEND_PORT_UDP}"
echo -e "  WebSocket: ws://localhost:${BACKEND_PORT_WS}/"
echo ""
echo -e "${GREEN}Client:${NC}"
echo -e "  Browser:   http://localhost:${CLIENT_PORT}/"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:   $LOG_DIR/backend.log"
echo -e "  Client:    $LOG_DIR/client.log"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"
echo ""

# Monitor the processes and keep the script running
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}Backend server stopped unexpectedly${NC}"
        echo -e "${YELLOW}Last log entries:${NC}"
        tail -20 "$LOG_DIR/backend.log"
        exit 1
    fi
    
    # Check if client is still running
    if ! kill -0 $CLIENT_PID 2>/dev/null; then
        echo -e "${RED}Client server stopped unexpectedly${NC}"
        echo -e "${YELLOW}Last log entries:${NC}"
        tail -20 "$LOG_DIR/client.log"
        exit 1
    fi
    
    sleep 5
done
