# BPSR Meter - MSI Build Script for Windows
# Run this script on Windows to build the MSI installer

param(
    [string]$SourceArchive = "",
    [string]$BuildDir = "F:\dps"
)

$ErrorActionPreference = 'Stop'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  BPSR Meter - MSI Builder" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is installed
try {
    $pnpmVersion = cmd /c "pnpm --version 2>&1"
    Write-Host "[✓] pnpm found: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] pnpm not found!" -ForegroundColor Red
    Write-Host "Install pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js not found!" -ForegroundColor Red
    Write-Host "Install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# If source archive provided, extract it
if ($SourceArchive -and (Test-Path $SourceArchive)) {
    Write-Host "[1/4] Extracting source archive..." -ForegroundColor Yellow
    $archivePath = Resolve-Path $SourceArchive
    $extractDir = Join-Path $BuildDir "BPSR-Meter"
    
    if (Test-Path $extractDir) {
        Write-Host "  Removing old build directory..." -ForegroundColor Gray
        Remove-Item -Path $extractDir -Recurse -Force
    }
    
    Set-Location $BuildDir
    Write-Host "  Extracting $archivePath..." -ForegroundColor Gray
    tar -xzf $archivePath
    Write-Host "  ✓ Extraction complete" -ForegroundColor Green
    
    Set-Location $extractDir
} else {
    # Assume we're already in the project directory
    Write-Host "[1/4] Using current directory..." -ForegroundColor Yellow
    $currentDir = Get-Location
    Write-Host "  Location: $currentDir" -ForegroundColor Gray
    
    if (-not (Test-Path "package.json")) {
        Write-Host "[✗] package.json not found!" -ForegroundColor Red
        Write-Host "Run this script from the BPSR-Meter directory or provide source archive" -ForegroundColor Yellow
        exit 1
    }
}

# Get version from package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
Write-Host "  Version: $version" -ForegroundColor Cyan
Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
try {
    cmd /c "pnpm install 2>&1"
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "[✗] Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Build MSI
Write-Host "[3/4] Building MSI installer..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray
try {
    cmd /c "pnpm dist 2>&1"
    Write-Host "  ✓ Build complete" -ForegroundColor Green
} catch {
    Write-Host "[✗] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Verify and report
Write-Host "[4/4] Verifying build output..." -ForegroundColor Yellow
$msiName = "Infamous BPSR DPS Meter-Setup-$version.msi"
$msiPath = Join-Path "dist_electron" $msiName

if (Test-Path $msiPath) {
    $msiSize = (Get-Item $msiPath).Length / 1MB
    $msiFullPath = Resolve-Path $msiPath
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "MSI Installer Details:" -ForegroundColor Cyan
    Write-Host "  Name:     $msiName" -ForegroundColor White
    Write-Host "  Version:  $version" -ForegroundColor White
    Write-Host "  Size:     $([math]::Round($msiSize, 2)) MB" -ForegroundColor White
    Write-Host "  Location: $msiFullPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test the installer on a clean Windows system" -ForegroundColor White
    Write-Host "  2. Run check-dependencies.ps1 after installation" -ForegroundColor White
    Write-Host "  3. Verify all features work correctly" -ForegroundColor White
    Write-Host "  4. Upload to GitHub Releases" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to open the folder
    $response = Read-Host "Open installer location in Explorer? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        explorer.exe (Split-Path $msiFullPath)
    }
    
} else {
    Write-Host ""
    Write-Host "[✗] MSI not found at: $msiPath" -ForegroundColor Red
    Write-Host "Check the build output above for errors." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Build process complete!" -ForegroundColor Green
