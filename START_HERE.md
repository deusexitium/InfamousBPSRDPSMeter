# 🚀 START HERE - Deploy to GitHub in 3 Steps!

## Super Simple Deployment

I've created everything you need. Just run these commands:

---

## Step 1: Run the Script

```bash
cd /development/BPSR-Meter
./deploy-to-github.sh
```

The script will:
- ✅ Initialize Git
- ✅ Add all files
- ✅ Create commit
- ✅ Create tag v2.95.6
- ✅ Push to GitHub

**You'll need to enter:**
- Your name (for git commits)
- Your email (for git commits)
- Confirm to push (type 'y')

**For authentication, you'll need:**
- Personal Access Token (NOT your password)
- Get it from: https://github.com/settings/tokens

---

## Step 2: Create GitHub Release

After the script finishes:

1. Go to: https://github.com/beaRSZT/BPSR_dev/releases
2. Click **"Draft a new release"**
3. Select tag: `v2.95.6`
4. Title: `⚔️ v2.95.6 - Player Details Fix Release`
5. Copy description from `RELEASE_NOTES_v2.95.6.md`
6. Click **"Attach binaries"**
7. Upload: `F:\dps\Infamous BPSR DPS Meter-Setup-2.95.6.exe`
8. Click **"Publish release"**

Done! 🎉

---

## Step 3: Announce

Share your release:
- Discord
- Reddit r/BlueProtocol
- Twitter/X
- Twitch

---

## 🔐 GitHub Authentication

### Option 1: Personal Access Token (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "BPSR Deployment"
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `workflow`
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

### Option 2: SSH Keys

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH Keys → New SSH Key
# Then change remote URL:
cd /development/BPSR-Meter
git remote set-url origin git@github.com:beaRSZT/BPSR_dev.git
```

---

## ❓ Troubleshooting

### "Authentication failed"
- Use Personal Access Token, not password
- GitHub doesn't accept passwords anymore
- Get token: https://github.com/settings/tokens

### "Permission denied"
- Make script executable: `chmod +x deploy-to-github.sh`
- Or run: `bash deploy-to-github.sh`

### "Remote already exists"
- Script will handle this automatically
- It updates the remote URL

### "Nothing to commit"
- Files already committed
- You can skip to creating the release

---

## 📝 Manual Commands (If Script Fails)

If the script doesn't work, run these manually:

```bash
cd /development/BPSR-Meter

# 1. Init git
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"

# 2. Add remote
git remote add origin https://github.com/beaRSZT/BPSR_dev.git

# 3. Commit
git add .
git commit -m "🎉 Initial commit - Infamous BPSR Meter v2.95.6"

# 4. Tag
git tag -a v2.95.6 -m "Release v2.95.6 - Player Details Fix"

# 5. Push
git push -u origin main
git push origin v2.95.6
```

---

## ✅ That's It!

After these steps, your project will be:
- ✅ On GitHub
- ✅ With proper version tag
- ✅ Ready for release creation

**Total time: ~5 minutes** ⏱️

---

## 📞 Need More Help?

See detailed guides:
- `GITHUB_DEPLOYMENT.md` - Complete walkthrough
- `DEPLOYMENT_SUMMARY.md` - Overview & checklist
- `RELEASE_NOTES_v2.95.6.md` - What to put in release

---

## 🎉 Good Luck!

You've got this! The script does 90% of the work. ⚔️
