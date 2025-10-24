#!/bin/bash
# BPSR Meter v2.5.1 - Build and Package Script
# This script builds the application and creates a tar package

set -e

echo "=========================================================="
echo "  BPSR Meter Enhanced Edition v2.5.1"
echo "  Build and Package Script"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    echo "Please run this script from the BPSR-Meter directory"
    exit 1
fi

echo "[1/5] Checking Node.js and pnpm..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 22+ from https://nodejs.org/"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"
echo ""

echo "[2/5] Installing dependencies..."
pnpm install
echo ""

echo "[3/5] Building Windows installer..."
pnpm dist
echo ""

echo "[4/5] Creating distribution package..."
PACKAGE_NAME="bpsr-meter-v2.5.1"
PACKAGE_DIR="dist_package"
TAR_FILE="${PACKAGE_NAME}.tar.gz"

# Clean previous package
rm -rf "$PACKAGE_DIR"
rm -f "$TAR_FILE"

# Create package directory structure
mkdir -p "$PACKAGE_DIR/$PACKAGE_NAME"

# Copy installer if it exists
if [ -d "dist_electron" ]; then
    echo "  - Copying Windows installer..."
    cp -r dist_electron "$PACKAGE_DIR/$PACKAGE_NAME/"
fi

# Copy documentation
echo "  - Copying documentation..."
cp README.md "$PACKAGE_DIR/$PACKAGE_NAME/"
cp HOW-TO-BUILD.md "$PACKAGE_DIR/$PACKAGE_NAME/"
cp LICENSE "$PACKAGE_DIR/$PACKAGE_NAME/" 2>/dev/null || echo "  - No LICENSE file found"
cp CHANGELOG-v2.5.1.md "$PACKAGE_DIR/$PACKAGE_NAME/" 2>/dev/null || echo "  - No CHANGELOG file found"

# Copy icons
echo "  - Copying icons..."
cp icon.ico "$PACKAGE_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp icon.png "$PACKAGE_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp portada.png "$PACKAGE_DIR/$PACKAGE_NAME/" 2>/dev/null || true

# Create installation instructions
cat > "$PACKAGE_DIR/$PACKAGE_NAME/INSTALL.txt" << 'EOF'
BPSR Meter v2.5.1 - Installation Instructions
==============================================

PREREQUISITES:
1. Install Npcap from https://npcap.com/
   - Enable "WinPcap API-compatible Mode"
   - Enable "Support loopback traffic"

INSTALLATION:
1. Navigate to the dist_electron folder
2. Run "BPSR Meter Setup 2.5.1.exe" as Administrator
3. Follow the installation wizard

USAGE:
1. Launch BPSR Meter as Administrator
2. Start Blue Protocol
3. Enter combat - the meter will automatically start tracking
4. Use the controls to collapse, export, or configure settings

FEATURES:
- Collapsible UI (starts collapsed by default if configured)
- Export data to CSV or Markdown (MDC) format
- Click any player to see detailed breakdown
- Filter by ALL, DMG (DPS), TANK, or HEAL
- Duration counter shows data collection time
- Settings persist between sessions
- Data is preserved on refresh (no clearing)

TROUBLESHOOTING:
- If no data appears, change instance/channel once
- Run as Administrator
- Check that Npcap is installed correctly
- Ensure firewall isn't blocking the application

For more information, see README.md
EOF

echo "[5/5] Creating tar archive..."
cd "$PACKAGE_DIR"
tar -czf "../$TAR_FILE" "$PACKAGE_NAME"
cd ..

# Cleanup
rm -rf "$PACKAGE_DIR"

echo ""
echo "=========================================================="
echo "  BUILD SUCCESSFUL!"
echo "=========================================================="
echo ""
echo "Package created: $TAR_FILE"
echo "Size: $(du -h "$TAR_FILE" | cut -f1)"
echo ""

if [ -d "dist_electron" ]; then
    echo "Windows installer location:"
    ls -lh dist_electron/*.exe 2>/dev/null || echo "  No .exe files found"
    echo ""
fi

echo "To extract the package:"
echo "  tar -xzf $TAR_FILE"
echo ""
echo "Next steps:"
echo "1. Test the installer on a Windows machine"
echo "2. Upload $TAR_FILE to GitHub releases"
echo "3. Update release notes with changelog"
echo ""
