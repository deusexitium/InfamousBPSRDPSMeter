# 🚀 GitHub Deployment Guide - BPSR_dev

Complete step-by-step guide to push your project to GitHub and create a release.

---

## 📋 Prerequisites

✅ GitHub account created
✅ Git installed locally
✅ Repository created: `beaRSZT/BPSR_dev`
✅ All files ready in `/development/BPSR-Meter`

---

## 🔧 Step 1: Initialize Git Repository

```bash
cd /development/BPSR-Meter

# Initialize git (if not already done)
git init

# Set your identity
git config user.name "beaRSZT"
git config user.email "your-email@example.com"

# Add remote repository
git remote add origin https://github.com/beaRSZT/BPSR_dev.git
```

---

## 📦 Step 2: Prepare Files

### Check what will be committed:
```bash
git status
```

### Add all files (respecting .gitignore):
```bash
git add .
```

### Verify files to be committed:
```bash
git status
```

### Should see:
```
✅ README.md
✅ CHANGELOG.md
✅ RELEASE_NOTES_v2.95.6.md
✅ package.json
✅ server.js
✅ electron-main.js
✅ public/
✅ src/
✅ algo/
❌ node_modules/ (ignored)
❌ dist_electron/ (ignored)
❌ *.log (ignored)
```

---

## 💾 Step 3: Initial Commit

```bash
# Commit with descriptive message
git commit -m "🎉 Initial commit - Infamous BPSR Meter v2.95.6

- Complete source code
- Modern UI with player details expansion
- Session management system
- VPN compatibility with auto-detection
- Comprehensive documentation
- Build scripts for MSI generation

Features:
✅ Real-time DPS/HPS tracking
✅ Player skill breakdown
✅ Session save/load/delete
✅ Auto local player detection
✅ Copy individual/team stats
✅ Full ExitLag/VPN support"
```

---

## 🌐 Step 4: Push to GitHub

### First time push:
```bash
# Push to main branch
git push -u origin main
```

### If branch is 'master' instead:
```bash
git branch -M main
git push -u origin main
```

### Expected output:
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 1.50 MiB | 500.00 KiB/s, done.
Total 150 (delta 30), reused 0 (delta 0)
To https://github.com/beaRSZT/BPSR_dev.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🏷️ Step 5: Create Git Tag

```bash
# Create annotated tag
git tag -a v2.95.6 -m "Release v2.95.6 - Player Details Fix

Critical Fixes:
- Fixed player expansion feature
- Removed duplicate click handlers
- Modal interactions fully working

New Features:
- Player details panel with skills
- Session management system
- Copy individual player stats
- Auto-save on character switch"

# Push tag to GitHub
git push origin v2.95.6
```

---

## 📦 Step 6: Build Release Binary

### From WSL:
```bash
# Build MSI installer
pnpm build-msi

# Verify output
ls -lh /mnt/f/dps/*.exe

# Should see:
# Infamous BPSR DPS Meter-Setup-2.95.6.exe (90M)
```

### Installer location:
```
F:\dps\Infamous BPSR DPS Meter-Setup-2.95.6.exe
```

---

## 🎁 Step 7: Create GitHub Release

### Via GitHub Web Interface:

1. **Go to Releases:**
   - Navigate to: `https://github.com/beaRSZT/BPSR_dev/releases`
   - Click **"Draft a new release"**

2. **Choose Tag:**
   - Select: `v2.95.6`
   - Or create new tag: `v2.95.6`

3. **Release Title:**
   ```
   ⚔️ v2.95.6 - Player Details Fix Release
   ```

4. **Description:** Copy from `RELEASE_NOTES_v2.95.6.md`
   ```markdown
   ## 🎉 The Player Details Fix Release
   
   This release fixes the critical player expansion feature. Players can now click any row to view detailed stats and skills!
   
   ### 🐛 Critical Fixes
   - ✅ Fixed player expansion (removed duplicate handler)
   - ✅ Click any player → Details expand correctly
   - ✅ Skills display working
   - ✅ Copy buttons visible and functional
   
   ### ✨ Features
   - 📊 Player Details Panel with top 10 skills
   - 📋 Copy Stats Only / Copy with Skills
   - 💾 Session Management (save/load/delete)
   - 🎯 Auto local player detection
   - ⚡ Full VPN support (ExitLag, WTFast, etc.)
   
   ### 📦 Installation
   1. Download `Infamous-BPSR-DPS-Meter-Setup-2.95.6.exe`
   2. Run as Administrator
   3. Install Npcap if prompted
   4. Launch from Start Menu
   
   ### 🔗 Links
   - [Changelog](CHANGELOG.md)
   - [README](README.md)
   - [Report Issues](https://github.com/beaRSZT/BPSR_dev/issues)
   ```

5. **Upload Binary:**
   - Click **"Attach binaries"**
   - Upload: `Infamous BPSR DPS Meter-Setup-2.95.6.exe`
   - Optionally add: Source code archives (auto-generated)

6. **Pre-release?**
   - ❌ Uncheck (this is stable)

7. **Set as latest release:**
   - ✅ Check this

8. **Publish Release:**
   - Click **"Publish release"**

---

## ✅ Step 8: Verify Release

### Check these pages:

1. **Repository:** https://github.com/beaRSZT/BPSR_dev
   - ✅ Files visible
   - ✅ README displayed
   - ✅ Version badges showing v2.95.6

2. **Releases:** https://github.com/beaRSZT/BPSR_dev/releases
   - ✅ v2.95.6 visible as latest
   - ✅ Installer downloadable
   - ✅ Release notes formatted correctly

3. **Clone Test:**
   ```bash
   cd /tmp
   git clone https://github.com/beaRSZT/BPSR_dev.git
   cd BPSR_dev
   ls -la
   # Should see all source files
   ```

---

## 🔄 Future Updates

### For next release (e.g., v2.95.7):

```bash
# 1. Make code changes
# 2. Update versions in files
# 3. Update CHANGELOG.md

# 4. Commit changes
git add .
git commit -m "🔧 v2.95.7 - [Brief description]"

# 5. Create tag
git tag -a v2.95.7 -m "Release v2.95.7"

# 6. Push
git push origin main
git push origin v2.95.7

# 7. Build MSI
pnpm build-msi

# 8. Create GitHub release (same as Step 7)
```

---

## 📝 Branch Strategy

### Recommended Workflow:

```bash
# Main branch (stable releases)
main

# Development branch (active work)
git checkout -b develop

# Feature branches
git checkout -b feature/new-feature
git checkout -b fix/bug-fix
git checkout -b hotfix/critical-fix
```

### Merging:
```bash
# Merge feature into develop
git checkout develop
git merge feature/new-feature

# When ready for release, merge to main
git checkout main
git merge develop
git tag -a v2.95.7 -m "Release v2.95.7"
git push origin main --tags
```

---

## 🛠️ Troubleshooting

### Authentication Issues:

**Using HTTPS (with Personal Access Token):**
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/beaRSZT/BPSR_dev.git
```

**Using SSH:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: Settings → SSH Keys → New SSH Key
# Paste contents of: ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:beaRSZT/BPSR_dev.git
```

### Large Files:

If you have files >100MB:
```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.exe"
git lfs track "*.msi"
git lfs track "*.zip"

# Commit .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

### Accidental Commit:

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Remove file from Git but keep locally
git rm --cached filename
```

---

## 📊 Repository Settings

### Recommended Settings on GitHub:

1. **About Section:**
   - Description: "⚔️ Infamous BPSR DPS Meter - Ultimate Blue Protocol combat tracker"
   - Website: Your stream/social link
   - Topics: `blue-protocol`, `dps-meter`, `electron`, `gaming`, `tool`

2. **Features:**
   - ✅ Issues enabled
   - ✅ Wiki enabled (for guides)
   - ❌ Projects (optional)
   - ❌ Sponsorships (optional)

3. **Pull Requests:**
   - ✅ Allow squash merging
   - ✅ Automatically delete head branches

4. **Protection Rules (for main):**
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass

---

## ✅ Checklist

Before creating release:

- [ ] Version updated in all files
- [ ] CHANGELOG.md updated
- [ ] README.md accurate
- [ ] .gitignore comprehensive
- [ ] All tests passed
- [ ] MSI built successfully
- [ ] Code committed
- [ ] Tag created
- [ ] Pushed to GitHub
- [ ] Release created
- [ ] Binary uploaded
- [ ] Release notes added
- [ ] Verified download works

---

## 🎉 You're Done!

Your project is now live on GitHub with a proper release!

**Share the release:**
- Discord
- Reddit r/BlueProtocol
- Twitter/X
- Twitch stream

**Monitor:**
- GitHub Issues for bug reports
- Download stats in Releases
- Community feedback

---

## 📞 Need Help?

- **GitHub Docs:** https://docs.github.com
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **Electron Distribution:** https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging

---

Good luck with your release! 🚀⚔️
