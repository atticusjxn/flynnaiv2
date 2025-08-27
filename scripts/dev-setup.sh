#!/bin/bash

# Flynn.ai v2 - Development Environment Setup
# This script sets up the optimal development environment

set -e  # Exit on any error

echo "🚀 Flynn.ai v2 - Development Environment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Node.js version: $(node -v)${NC}"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok not found. Installing via npm...${NC}"
    npm install -g ngrok
else
    echo -e "${BLUE}🌐 ngrok version: $(ngrok version)${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📚 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Install concurrently if not present
if ! npm list concurrently &> /dev/null; then
    echo -e "${YELLOW}🔧 Installing concurrently...${NC}"
    npm install --save-dev concurrently@^8.2.2
fi

# Create ngrok config if it doesn't exist
if [ ! -f "$HOME/.ngrok2/ngrok.yml" ]; then
    echo -e "${YELLOW}🔑 Setting up ngrok configuration...${NC}"
    echo "Please run 'ngrok authtoken YOUR_TOKEN' with your ngrok auth token"
else
    echo -e "${GREEN}✅ ngrok configuration found${NC}"
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo -e "${YELLOW}Please create .env.local with required environment variables${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Environment file found${NC}"
fi

# Validate key environment variables
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    exit 1
fi

if ! grep -q "TWILIO_ACCOUNT_SID" .env.local; then
    echo -e "${RED}❌ TWILIO_ACCOUNT_SID not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Key environment variables found${NC}"

# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.js

echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Quick Start Commands:${NC}"
echo -e "  ${YELLOW}npm run dev${NC}           - Start Next.js with Turbopack"
echo -e "  ${YELLOW}npm run dev:full${NC}      - Start Next.js + ngrok tunnel"
echo -e "  ${YELLOW}npm run ngrok${NC}         - Start ngrok tunnel only"
echo -e "  ${YELLOW}npm run test:webhook${NC}  - Test webhook processing"
echo ""
echo -e "${BLUE}🌐 Development URLs:${NC}"
echo -e "  Local:  http://localhost:3000"
echo -e "  Tunnel: https://flynn-dev.ngrok-free.app"
echo -e "  ngrok:  http://localhost:4040 (inspection)"
echo ""
echo -e "${GREEN}Ready for development! 🚀${NC}"