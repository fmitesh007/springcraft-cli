# AUR Package for springcraft

## Install on Arch Linux

### Option 1: Manual build from PKGBUILD

```bash
# Clone or download PKGBUILD to a directory
cd /path/to/arch

# Install dependencies (usually none for standalone binary)
makepkg -si
```

### Option 2: Using an AUR helper (e.g., yay, paru)

```bash
# With yay
yay -S springcraft

# With paru
paru -S springcraft
```

## Publishing to AUR

1. Create an account at https://aur.archlinux.org/

2. Generate SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your@email.com"
   ```

3. Add SSH key to AUR account settings

4. Clone the AUR repository:
   ```bash
   git clone ssh://aur@aur.archlinux.org/springcraft.git
   ```

5. Copy PKGBUILD and .SRCINFO to the cloned repo:
   ```bash
   cp /path/to/main/repo/arch/PKGBUILD .
   cp /path/to/main/repo/arch/.SRCINFO .
   ```

6. Update the Maintainer field in PKGBUILD with your AUR username

7. Commit and push:
   ```bash
   git add PKGBUILD .SRCINFO
   git commit -m "Initial AUR package"
   git push
   ```

## Notes

- This package downloads the pre-built binary from GitHub releases
- No build dependencies required
- Works on x86_64 and aarch64 architectures
