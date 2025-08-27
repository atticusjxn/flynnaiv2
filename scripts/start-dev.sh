#!/bin/bash

# Flynn.ai v2 - Start Development Environment
# This script starts the full development stack

set -e

echo "🚀 Starting Flynn.ai v2 Development Environment"
echo "==============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Start ngrok in background if not already running
if ! pgrep -f "ngrok http 3000" > /dev/null; then
    echo -e "${BLUE}🌐 Starting ngrok tunnel...${NC}"
    ngrok http 3000 --subdomain=flynn-dev --log=stdout > /dev/null 2>&1 &
    NGROK_PID=$!
    echo -e "${GREEN}✅ ngrok started (PID: $NGROK_PID)${NC}"
    
    # Wait for ngrok to start
    echo -e "${YELLOW}⏳ Waiting for ngrok to initialize...${NC}"
    sleep 3
else
    echo -e "${GREEN}✅ ngrok already running${NC}"
fi

# Show ngrok status
echo -e "${BLUE}🌐 ngrok URL: https://flynn-dev.ngrok-free.app${NC}"
echo -e "${BLUE}🔍 ngrok dashboard: http://localhost:4040${NC}"

echo ""
echo -e "${GREEN}🎯 Starting Next.js with Turbopack...${NC}"
echo -e "${YELLOW}Expected improvements:${NC}"
echo -e "  • 76% faster server startup"
echo -e "  • 96% faster HMR updates"
echo ""

# Start Next.js with Turbopack
npm run dev

# Cleanup function for graceful shutdown
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development environment...${NC}"
    if [ ! -z "$NGROK_PID" ] && kill -0 $NGROK_PID 2>/dev/null; then
        kill $NGROK_PID
        echo -e "${GREEN}✅ ngrok stopped${NC}"
    fi
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM