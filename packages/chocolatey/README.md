# Chocolatey Package

## Submit to Chocolatey

1. **Create an account at:** https://community.chocolatey.org/

2. **Create the package:**
   ```powershell
   # Install Chocolatey CLI first if needed
   Set-ExecutionPolicy Bypass -Scope Process -Force
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   
   # Create package template
   choco new springcraft
   cd springcraft
   ```

3. **Update the nuspec** with the actual content from `springcraft.nuspec`

4. **Add the binary:**
   ```powershell
   mkdir tools
   curl -L -o tools/springcraft.exe https://github.com/fmitesh007/springcraft-cli/releases/download/v0.3.0/springcraft-win.exe
   ```

5. **Pack and test:**
   ```powershell
   choco pack
   choco install springcraft -s .
   ```

6. **Push to Chocolatey:**
   ```powershell
   choco push springcraft.0.3.0.nupkg --source=https://community.chocolatey.org/
   ```

## Notes
- Chocolatey review process takes 1-3 business days
- Package must pass verification before being publicly available
