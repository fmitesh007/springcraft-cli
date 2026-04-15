# AUR Package

## Current Status

This PKGBUILD is synced from the official AUR package: https://aur.archlinux.org/packages/springcraft

## Submit to AUR

### First Time Setup

1. **Create AUR account:** https://aur.archlinux.org/register

2. **Clone the AUR repo:**
   ```bash
   git clone ssh://aur@aur.archlinux.org/springcraft.git
   cd springcraft
   ```

3. **Copy files from this directory:**
   ```bash
   cp PKGBUILD .SRCINFO .
   git add -A
   git commit -m "Initial commit"
   git push
   ```

### Updating

When a new version is released:

1. **Update version in PKGBUILD:**
   ```bash
   # Edit PKGBUILD
   pkgver=0.3.0
   source=("https://github.com/fmitesh007/springcraft-cli/releases/download/v${pkgver}/springcraft-linux")
   
   # Get new sha256sum
   curl -L -o springcraft-linux https://github.com/fmitesh007/springcraft-cli/releases/download/v0.3.0/springcraft-linux
   sha256sum springcraft-linux
   # Update sha256sums in PKGBUILD
   ```

2. **Regenerate .SRCINFO:**
   ```bash
   makepkg --printsrcinfo > .SRCINFO
   ```

3. **Commit and push:**
   ```bash
   git add -A
   git commit -m "Update to v0.3.0"
   git push
   ```

## Files

- `PKGBUILD` - Arch Linux package build script
- `.SRCINFO` - Machine-readable package metadata

## Installation

```bash
# From AUR
yay -S springcraft

# Or manually
git clone https://aur.archlinux.org/springcraft.git
cd springcraft
makepkg -si
```
