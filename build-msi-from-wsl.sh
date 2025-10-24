#!/bin/bash
# BPSR Meter - Automated MSI Build from WSL
# This script handles the entire Windows build process from WSL

set -e  # Exit on error

echo "=========================================="
echo "  BPSR Meter - Installer Build from WSL"
echo "=========================================="
echo ""

# Configuration
VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
PROJECT_NAME="BPSR-Meter"
SOURCE_DIR="/development/BPSR-Meter"
WINDOWS_BUILD_DIR="/mnt/f/dps"
WINDOWS_BUILD_DIR_PS="F:\\dps"  # PowerShell format
ARCHIVE_NAME="${PROJECT_NAME}-v${VERSION}-source.tar.gz"

echo "Project: $PROJECT_NAME"
echo "Version: $VERSION"
echo "Build Directory: $WINDOWS_BUILD_DIR"
echo ""

# Step 1: Create source archive
echo "[1/6] Creating source archive..."
cd /development
tar --exclude='node_modules' \
    --exclude='dist_electron' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.tar' \
    --exclude='*.tar.gz' \
    -czf "$ARCHIVE_NAME" "$PROJECT_NAME"

echo "  ✓ Archive created: $ARCHIVE_NAME ($(du -h $ARCHIVE_NAME | cut -f1))"

# Step 2: Copy archive to Windows
echo "[2/6] Copying archive to Windows..."
cp "/development/$ARCHIVE_NAME" "$WINDOWS_BUILD_DIR/"
echo "  ✓ Copied to $WINDOWS_BUILD_DIR"

# Step 3: Extract on Windows using PowerShell
echo "[3/6] Extracting archive on Windows..."
powershell.exe -ExecutionPolicy Bypass -Command "
    Set-Location '$WINDOWS_BUILD_DIR_PS'
    if (Test-Path 'BPSR-Meter') {
        Write-Host '  Removing old build directory (this may take a moment)...'
        # Use robocopy to handle long paths
        if (Test-Path 'BPSR-Meter-empty-temp') {
            Remove-Item -Path 'BPSR-Meter-empty-temp' -Force
        }
        New-Item -ItemType Directory -Path 'BPSR-Meter-empty-temp' -Force | Out-Null
        robocopy 'BPSR-Meter-empty-temp' 'BPSR-Meter' /MIR /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
        Remove-Item -Path 'BPSR-Meter' -Recurse -Force
        Remove-Item -Path 'BPSR-Meter-empty-temp' -Force
        Write-Host '  Old directory removed'
    }
    Write-Host '  Extracting archive...'
    tar -xzf '$ARCHIVE_NAME'
    Write-Host '  ✓ Extraction complete'
"

# Step 4: Install dependencies on Windows
echo "[4/6] Installing dependencies on Windows..."
powershell.exe -ExecutionPolicy Bypass -Command "
    Set-Location '$WINDOWS_BUILD_DIR_PS\\BPSR-Meter'
    Write-Host '  Running pnpm install...'
    cmd /c 'pnpm install 2>&1'
    Write-Host '  ✓ Dependencies installed'
"

# Step 5: Build installer on Windows
echo "[5/6] Building installer on Windows..."
powershell.exe -ExecutionPolicy Bypass -Command "
    Set-Location '$WINDOWS_BUILD_DIR_PS\\BPSR-Meter'
    Write-Host '  Running pnpm dist...'
    cmd /c 'pnpm dist 2>&1'
    Write-Host '  ✓ Build complete'
"

# Step 6: Copy installer back and cleanup
echo "[6/6] Copying installer..."
EXE_NAME="Infamous BPSR DPS Meter-Setup-${VERSION}.exe"

# Copy NSIS EXE
if [ -f "$WINDOWS_BUILD_DIR/BPSR-Meter/dist_electron/$EXE_NAME" ]; then
    cp "$WINDOWS_BUILD_DIR/BPSR-Meter/dist_electron/$EXE_NAME" "$WINDOWS_BUILD_DIR/"
    EXE_SIZE=$(du -h "$WINDOWS_BUILD_DIR/$EXE_NAME" | cut -f1)
    echo "  ✓ Installer copied to: $WINDOWS_BUILD_DIR/$EXE_NAME ($EXE_SIZE)"
    
    echo ""
    echo "=========================================="
    echo "  BUILD SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "Installer Location: $WINDOWS_BUILD_DIR/$EXE_NAME"
    echo "Installer Size: $EXE_SIZE"
    echo "Version: $VERSION"
    echo ""
    echo "You can now distribute this installer."
    echo "It includes all requirements and creates desktop + start menu shortcuts."
    echo ""
else
    echo ""
    echo "✗ ERROR: Installer not found in dist_electron"
    echo "Check the build output above for errors."
    exit 1
fi

# Automatic cleanup
echo ""
echo "Cleaning up temporary files..."
rm -rf "$WINDOWS_BUILD_DIR/BPSR-Meter"
rm "$WINDOWS_BUILD_DIR/$ARCHIVE_NAME"
echo "  ✓ Cleanup complete"
echo ""
echo "Build process finished!"
