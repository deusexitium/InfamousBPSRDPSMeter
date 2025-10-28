#!/bin/bash
# ========================================================
# BPSR Meter - Repository Cleanup Script
# ========================================================
# Purpose: Clean up development artifacts, logs, and temporary files
# Run this periodically to keep repository size manageable
# ========================================================

echo ""
echo "========================================================"
echo " BPSR Meter - Repository Cleanup"
echo "========================================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Track what we're cleaning
CLEANED=0

echo "[1/7] Cleaning build artifacts..."
if [ -d "dist_electron" ]; then
    rm -rf dist_electron
    echo "  ✓ Removed dist_electron/"
    CLEANED=1
fi
if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✓ Removed dist/"
    CLEANED=1
fi
[ $CLEANED -eq 0 ] && echo "  ✓ No build artifacts found"
CLEANED=0

echo ""
echo "[2/7] Cleaning user data files..."
rm -f settings.json player_map.json users.json 2>/dev/null && echo "  ✓ Removed user data files" || echo "  ✓ No user data files found"

echo ""
echo "[3/7] Cleaning log files..."
rm -f *.log 2>/dev/null && echo "  ✓ Removed log files" || echo "  ✓ No log files found"
if [ -d "logs" ]; then
    rm -rf logs
    echo "  ✓ Removed logs/ directory"
fi

echo ""
echo "[4/7] Cleaning old archives..."
rm -f *.tar *.tar.gz *.zip 2>/dev/null && echo "  ✓ Removed archive files" || echo "  ✓ No archive files found"

echo ""
echo "[5/7] Cleaning temporary files..."
rm -f *.tmp *.temp 2>/dev/null && echo "  ✓ Removed temp files" || echo "  ✓ No temp files found"
rm -rf .cache 2>/dev/null && echo "  ✓ Removed .cache/" || echo "  ✓ No .cache/ found"

echo ""
echo "[6/7] Cleaning old images..."
rm -f PORTADA*.jpg PORTADA*.png medidor.png portada.png 2>/dev/null && echo "  ✓ Removed old images" || echo "  ✓ No old images found"

echo ""
echo "[7/7] Cleaning Windows temp build..."
WIN_USER=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')
if [ -n "$WIN_USER" ]; then
    WIN_TEMP="/mnt/c/Users/$WIN_USER/AppData/Local/Temp/BPSR-Meter-Build"
    if [ -d "$WIN_TEMP" ]; then
        rm -rf "$WIN_TEMP"
        echo "  ✓ Removed Windows temp build directory"
    else
        echo "  ✓ No Windows temp build found"
    fi
else
    echo "  ⚠ Not running in WSL, skipping Windows temp cleanup"
fi

echo ""
echo "========================================================"
echo " Cleanup Complete!"
echo "========================================================"
echo ""
echo "Repository is clean. Current size:"
du -sh . 2>/dev/null | awk '{print "  " $1}'
echo ""
echo "Largest directories:"
du -sh */ 2>/dev/null | sort -hr | head -5 | awk '{print "  " $0}'
echo ""
