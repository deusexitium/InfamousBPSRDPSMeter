# BPSR Meter - Dependency Checker
# This script checks for required dependencies and offers to install them

$ErrorActionPreference = 'Continue'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  BPSR Meter - Dependency Checker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[WARNING] Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some checks may not work properly." -ForegroundColor Yellow
    Write-Host ""
}

# Function to check Npcap
function Test-Npcap {
    Write-Host "[1/2] Checking for Npcap..." -ForegroundColor Yellow
    
    $npcapPaths = @(
        "$env:ProgramFiles\Npcap",
        "$env:windir\System32\Npcap",
        "$env:windir\SysWOW64\Npcap"
    )
    
    $npcapFound = $false
    foreach ($path in $npcapPaths) {
        if (Test-Path "$path\wpcap.dll") {
            $npcapFound = $true
            Write-Host "  ✓ Npcap found at: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $npcapFound) {
        Write-Host "  ✗ Npcap NOT found" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Npcap is REQUIRED for BPSR Meter to work!" -ForegroundColor Red
        Write-Host "  Download from: https://npcap.com/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Installation instructions:" -ForegroundColor Yellow
        Write-Host "  1. Download Npcap installer" -ForegroundColor White
        Write-Host "  2. Run as Administrator" -ForegroundColor White
        Write-Host "  3. Enable 'WinPcap API-compatible Mode'" -ForegroundColor White
        Write-Host "  4. Enable 'Support loopback traffic'" -ForegroundColor White
        Write-Host ""
        
        $response = Read-Host "Open Npcap download page in browser? (Y/N)"
        if ($response -eq 'Y' -or $response -eq 'y') {
            Start-Process "https://npcap.com/#download"
        }
        return $false
    }
    
    # Check if Npcap service is running
    $npcapService = Get-Service -Name "npcap" -ErrorAction SilentlyContinue
    if ($npcapService) {
        if ($npcapService.Status -eq 'Running') {
            Write-Host "  ✓ Npcap service is running" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Npcap service is NOT running" -ForegroundColor Yellow
            Write-Host "  Attempting to start service..." -ForegroundColor Yellow
            try {
                Start-Service -Name "npcap"
                Write-Host "  ✓ Npcap service started successfully" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Failed to start Npcap service" -ForegroundColor Red
                Write-Host "  Run restart-npcap.bat as Administrator" -ForegroundColor Yellow
            }
        }
    }
    
    return $true
}

# Function to check Visual C++ Redistributables
function Test-VCRedist {
    Write-Host "[2/2] Checking for Visual C++ Redistributables..." -ForegroundColor Yellow
    
    $vcRedistKeys = @(
        "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
        "HKLM:\SOFTWARE\Microsoft\DevDiv\VC\Servicing\14.0\RuntimeMinimum",
        "HKLM:\SOFTWARE\Classes\Installer\Dependencies\VC,redist.x64*"
    )
    
    $vcFound = $false
    foreach ($key in $vcRedistKeys) {
        if (Test-Path $key) {
            $vcFound = $true
            Write-Host "  ✓ Visual C++ Redistributable found" -ForegroundColor Green
            break
        }
    }
    
    if (-not $vcFound) {
        Write-Host "  ⚠ Visual C++ Redistributables may not be installed" -ForegroundColor Yellow
        Write-Host "  The app may still work, but if you encounter errors:" -ForegroundColor Yellow
        Write-Host "  Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe" -ForegroundColor Cyan
        Write-Host ""
        return $false
    }
    
    return $true
}

# Run all checks
Write-Host ""
$npcapOk = Test-Npcap
Write-Host ""
$vcOk = Test-VCRedist
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Dependency Check Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($npcapOk -and $vcOk) {
    Write-Host "✓ All dependencies satisfied!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run BPSR Meter." -ForegroundColor Green
} else {
    Write-Host ""
    if (-not $npcapOk) {
        Write-Host "✗ Npcap is REQUIRED - Install from https://npcap.com/" -ForegroundColor Red
    }
    if (-not $vcOk) {
        Write-Host "⚠ VC++ Redistributables recommended" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Install missing dependencies and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
