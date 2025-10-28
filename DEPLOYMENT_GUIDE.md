# 🚀 Deployment Guide

## Quick Deploy

```bash
./deploy.sh 3.1.52          # Full deployment with manual testing pause
./deploy.sh 3.1.52 skip-tests   # Skip testing prompt (use with caution)
```

---

## What the Script Does

### Step 0: Update Versions
- Updates `package.json`
- Updates all HTML files (`index.html`)
- Updates all JS files (`main.js`)
- Updates `server.js`
- Updates `README.md`
- Updates installer filename references

### Step 1: Git Commit & Push
- Stages all changes
- Creates commit with version number
- Pushes to `origin main`

### Step 2: Create Git Tag
- Creates annotated tag `v3.1.52`
- Pushes tag to origin

### Step 3: Build Installer
- Runs `build-from-wsl.sh`
- Creates Windows installer (`.exe`)
- Includes all dependencies
- Signs with certificate

### Step 4: Copy to F:\DPS
- Copies `InfamousBPSRDPSMeter-Setup-X.X.XX.exe`
- Copies `latest.yml` (auto-update metadata)

### Step 5: Create GitHub Release
- Creates release page
- Generates release notes
- Links to installer download

### Step 6: Upload Assets
- Uploads `.exe` installer (~90MB)
- Uploads `latest.yml` for auto-update

---

## Manual Deployment (Step-by-Step)

If you need to deploy manually:

```bash
# 1. Update version in package.json
vim package.json  # Change "version": "3.1.52"

# 2. Update all version strings
sed -i 's/v3\.1\.51/v3.1.52/g' public/index.html public/js/main.js
sed -i "s/let VERSION = '3.1.51'/let VERSION = '3.1.52'/" server.js
sed -i 's/v3\.1\.51/v3.1.52/g' README.md

# 3. Commit and push
git add -A
git commit -m "v3.1.52 - Release"
git push origin main

# 4. Create tag
git tag -a v3.1.52 -m "Release v3.1.52"
git push origin v3.1.52

# 5. Build
bash build-from-wsl.sh

# 6. Copy to F:\DPS
cp /mnt/c/Users/sabir/AppData/Local/Temp/BPSR-Meter-Build/dist_electron/InfamousBPSRDPSMeter-Setup-3.1.52.exe /mnt/f/DPS/
cp /mnt/c/Users/sabir/AppData/Local/Temp/BPSR-Meter-Build/dist_electron/latest.yml /mnt/f/DPS/

# 7. Create GitHub release
gh release create v3.1.52 --repo ssalihsrz/InfamousBPSRDPSMeter --title "v3.1.52 - Release" --notes "Release notes here"

# 8. Upload assets
gh release upload v3.1.52 /mnt/f/DPS/InfamousBPSRDPSMeter-Setup-3.1.52.exe /mnt/f/DPS/latest.yml --repo ssalihsrz/InfamousBPSRDPSMeter
```

---

## Testing Checklist

Before deployment, test these critical features:

### UI & UX
- [ ] Window is draggable (title bar)
- [ ] Buttons are clickable
- [ ] Manual resize works (no empty space)
- [ ] Settings modal opens
- [ ] Session Manager opens

### Core Functionality
- [ ] Game server detected
- [ ] Player names captured
- [ ] DPS calculations correct
- [ ] Zone changes logged

### Session Management
- [ ] Sessions save automatically
- [ ] Session Manager loads sessions
- [ ] Sessions can be deleted
- [ ] Timestamps are local timezone

### Auto-Update
- [ ] Update notification shows
- [ ] "Download Update" opens browser
- [ ] latest.yml has correct version

---

## Troubleshooting

### Build Fails
- Check Node.js version (need 22.15.0)
- Run `npm install` if dependencies missing
- Check Windows signing certificate

### Git Push Fails
- Check remote URL: `git remote -v`
- Verify credentials: `gh auth status`
- Pull latest: `git pull origin main --rebase`

### Release Upload Fails
- Check GitHub CLI: `gh auth status`
- Verify release exists: `gh release view v3.1.52`
- Delete and recreate if needed: `gh release delete v3.1.52`

### Installer Not Found
- Build completed? Check console output
- Look in: `/mnt/c/Users/sabir/AppData/Local/Temp/BPSR-Meter-Build/dist_electron/`
- Check filename matches version number

---

## Post-Deployment

After deployment:

1. ✅ Test the installer on a fresh Windows machine
2. ✅ Verify auto-update notification appears in v3.1.51
3. ✅ Check GitHub release page renders correctly
4. ✅ Test download link works
5. ✅ Update any external documentation

---

## Version Numbering

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, major features
- **MINOR**: New features, significant improvements
- **PATCH**: Bug fixes, minor improvements

Examples:
- `3.1.52` → Bug fix
- `3.2.0` → New feature (zone detection improvement)
- `4.0.0` → Major rewrite
