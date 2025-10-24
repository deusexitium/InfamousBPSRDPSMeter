#!/bin/bash

# 🚀 Automated GitHub Deployment Script for BPSR Meter v2.95.6
# This script automates the git commands for deploying to GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 BPSR Meter v2.95.6 - GitHub Deployment Script        ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${NC}"

# Configuration
REPO_URL="https://github.com/beaRSZT/BPSR_dev.git"
VERSION="2.95.6"
BRANCH="main"

echo -e "${YELLOW}📋 Pre-flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in /development/BPSR-Meter?${NC}"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Error: git is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All checks passed${NC}\n"

# Step 1: Git Configuration
echo -e "${YELLOW}📝 Step 1: Configure Git${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if git is already configured
if [ -z "$(git config user.name)" ]; then
    read -p "Enter your name for Git commits: " git_name
    git config user.name "$git_name"
    echo -e "${GREEN}✅ Git name set to: $git_name${NC}"
else
    echo -e "${GREEN}✅ Git already configured: $(git config user.name)${NC}"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your email for Git commits: " git_email
    git config user.email "$git_email"
    echo -e "${GREEN}✅ Git email set to: $git_email${NC}"
else
    echo -e "${GREEN}✅ Git email already configured: $(git config user.email)${NC}"
fi

echo ""

# Step 2: Initialize Repository
echo -e "${YELLOW}🔧 Step 2: Initialize Git Repository${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists${NC}"
fi

echo ""

# Step 3: Add Remote
echo -e "${YELLOW}🌐 Step 3: Add Remote Repository${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! git remote | grep -q "origin"; then
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote 'origin' added: $REPO_URL${NC}"
else
    echo -e "${GREEN}✅ Remote 'origin' already exists${NC}"
    git remote set-url origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote URL updated: $REPO_URL${NC}"
fi

echo ""

# Step 4: Stage Files
echo -e "${YELLOW}📦 Step 4: Stage Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git add .
echo -e "${GREEN}✅ All files staged${NC}"

# Show what will be committed
echo -e "\n${BLUE}Files to be committed:${NC}"
git status --short | head -20
echo ""

# Step 5: Commit
echo -e "${YELLOW}💾 Step 5: Create Commit${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMMIT_MESSAGE="🎉 Initial commit - Infamous BPSR Meter v${VERSION}

Features:
✅ Real-time DPS/HPS tracking
✅ Player details expansion with skills
✅ Session management (save/load/delete)
✅ Auto local player detection
✅ Copy individual/team stats
✅ Full VPN support (ExitLag, WTFast, etc.)
✅ Modern UI with glassmorphism
✅ Window movement fixes
✅ Comprehensive documentation

Technical:
- Electron + Node.js + Express
- Packet capture with Npcap
- WebSocket real-time updates
- REST API for data access
- Persistent settings & sessions

Credits:
- dmlgzs (original)
- MrSnakeVT (engine)
- NeRooNx (UI)
- beaRSZT (v2.95.x)"

git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✅ Commit created${NC}"

echo ""

# Step 6: Create Tag
echo -e "${YELLOW}🏷️  Step 6: Create Version Tag${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TAG_MESSAGE="Release v${VERSION} - Player Details Fix

Critical Fixes:
- Fixed player expansion feature
- Removed duplicate click handlers
- Modal interactions fully working
- Window movement fixed

New Features:
- Player details panel with skills
- Session management system
- Copy individual player stats
- Auto-save on character switch

Technical:
- Removed event delegation conflict
- Z-index adjustments for modals
- Resize loop eliminated
- Logging spam removed"

if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag v${VERSION} already exists, deleting...${NC}"
    git tag -d "v${VERSION}"
fi

git tag -a "v${VERSION}" -m "$TAG_MESSAGE"
echo -e "${GREEN}✅ Tag v${VERSION} created${NC}"

echo ""

# Step 7: Push to GitHub
echo -e "${YELLOW}🚀 Step 7: Push to GitHub${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}This will push your code to GitHub.${NC}"
echo -e "${BLUE}You may be prompted for authentication.${NC}"
echo ""

read -p "Ready to push? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}⏸️  Push cancelled. You can push manually later with:${NC}"
    echo "   git push -u origin $BRANCH"
    echo "   git push origin v${VERSION}"
    exit 0
fi

echo ""
echo -e "${BLUE}Pushing to GitHub...${NC}"

# Push main branch
if git push -u origin "$BRANCH"; then
    echo -e "${GREEN}✅ Main branch pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push main branch${NC}"
    echo -e "${YELLOW}💡 If authentication failed, you need to:${NC}"
    echo "   1. Use a Personal Access Token instead of password"
    echo "   2. Or configure SSH keys"
    echo "   See: https://docs.github.com/en/authentication"
    exit 1
fi

# Push tag
if git push origin "v${VERSION}"; then
    echo -e "${GREEN}✅ Tag v${VERSION} pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push tag${NC}"
    exit 1
fi

echo ""

# Step 8: Success Summary
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT SUCCESSFUL!                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Repository: $REPO_URL"
echo "   Branch:     $BRANCH"
echo "   Version:    v${VERSION}"
echo "   Commit:     $(git rev-parse --short HEAD)"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to: https://github.com/beaRSZT/BPSR_dev/releases"
echo "2. Click 'Draft a new release'"
echo "3. Select tag: v${VERSION}"
echo "4. Title: ⚔️ v${VERSION} - Player Details Fix Release"
echo "5. Copy description from: RELEASE_NOTES_v${VERSION}.md"
echo "6. Upload binary: F:\\dps\\Infamous BPSR DPS Meter-Setup-${VERSION}.exe"
echo "7. Click 'Publish release'"
echo ""

echo -e "${GREEN}🎉 Your code is now on GitHub!${NC}"
echo ""
echo -e "${BLUE}View your repository at:${NC}"
echo "   https://github.com/beaRSZT/BPSR_dev"
echo ""
