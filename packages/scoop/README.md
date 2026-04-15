# Scoop Manifest

## Submit to Scoop

1. **Fork the Scoop bucket repo or use your own:**
   ```bash
   git clone https://github.com/ScoopInstaller/Main
   cd Main/bucket
   ```

2. **Copy the manifest:**
   ```bash
   cp /path/to/springcraft/dist/scoop/springcraft.json .
   ```

3. **Get the correct hash:**
   ```bash
   curl -L -o springcraft.exe https://github.com/fmitesh007/springcraft-cli/releases/download/v0.3.0/springcraft-win.exe
   sha256sum springcraft.exe
   # Update the hash in springcraft.json
   ```

4. **Test locally:**
   ```bash
   scoop bucket add mybucket /path/to/Main
   scoop install springcraft
   ```

5. **Submit PR to Scoop Main bucket**

## Auto-update

The manifest has `autoupdate` configured so future releases are automatically detected.
