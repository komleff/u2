#!/bin/bash

# Test script to validate the server startup automation
# This script verifies that all components can start successfully

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  U2 Server Startup - Validation Test                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_check() {
    local test_name=$1
    local command=$2
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1. Checking prerequisites..."
test_check "dotnet CLI available" "command -v dotnet"
test_check "npm CLI available" "command -v npm"
test_check "Node.js version >= 18" "node -v | grep -E 'v(1[8-9]|[2-9][0-9])\.[0-9]+\.[0-9]+'"
echo ""

echo "2. Checking project structure..."
test_check "U2.sln exists" "test -f U2.sln"
test_check "src/server/U2.Server.csproj exists" "test -f src/server/U2.Server.csproj"
test_check "package.json exists" "test -f package.json"
test_check "scripts/start-servers.sh exists" "test -f scripts/start-servers.sh"
test_check "scripts/start-servers.bat exists" "test -f scripts/start-servers.bat"
test_check "scripts/README.md exists" "test -f scripts/README.md"
echo ""

echo "3. Checking script executability..."
test_check "start-servers.sh is executable" "test -x scripts/start-servers.sh"
echo ""

echo "4. Building C# project..."
if dotnet build U2.sln -c Release --nologo -v quiet; then
    echo -e "${GREEN}✓ C# project builds successfully${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ C# project build failed${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo "5. Checking npm configuration..."
test_check "npm start:servers script exists" "grep -q 'start:servers' package.json"
test_check "Vite client package.json exists" "test -f src/clients/testbed/chatgpt-vite/package.json"
echo ""

echo "6. Testing backend server can start (3 second test)..."
# Try to start the server for a few seconds and then kill it
mkdir -p ./logs
dotnet run --project src/server/U2.Server.csproj --no-build -c Release -- --network > ./logs/test-backend.log 2>&1 &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Backend server starts successfully${NC}"
    ((TESTS_PASSED++))
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗ Backend server failed to start${NC}"
    echo -e "${YELLOW}Log output:${NC}"
    cat ./logs/test-backend.log
    ((TESTS_FAILED++))
fi
echo ""

echo "7. Checking port availability..."
# Use more portable port checking
if command -v lsof >/dev/null 2>&1; then
    test_check "Port 7777 is available" "! lsof -Pi :7777 -t"
    test_check "Port 8080 is available" "! lsof -Pi :8080 -t"
    test_check "Port 5173 is available" "! lsof -Pi :5173 -t"
elif command -v netstat >/dev/null 2>&1; then
    test_check "Port 7777 is available" "! netstat -tuln 2>/dev/null | grep -q ':7777 '"
    test_check "Port 8080 is available" "! netstat -tuln 2>/dev/null | grep -q ':8080 '"
    test_check "Port 5173 is available" "! netstat -tuln 2>/dev/null | grep -q ':5173 '"
elif command -v ss >/dev/null 2>&1; then
    test_check "Port 7777 is available" "! ss -tuln 2>/dev/null | grep -q ':7777 '"
    test_check "Port 8080 is available" "! ss -tuln 2>/dev/null | grep -q ':8080 '"
    test_check "Port 5173 is available" "! ss -tuln 2>/dev/null | grep -q ':5173 '"
else
    echo -e "${YELLOW}Skipping port checks (no lsof/netstat/ss available)${NC}"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Test Summary                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! The automation scripts should work correctly.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
