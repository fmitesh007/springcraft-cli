param(
    [string]$Version = "latest"
)

$REPO = "fmitesh007/springcraft-cli"
$INSTALL_DIR = "$env:LOCALAPPDATA\springcraft"
$BIN_NAME = "springcraft.exe"

# Get latest version if not specified
if ($Version -eq "latest") {
    $Response = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/releases/latest" -UseBasicParsing
    $Version = $Response.tag_name -replace '^v', ''
}

Write-Host "Installing springcraft v$Version..."

# Create install directory
if (-not (Test-Path $INSTALL_DIR)) {
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
}

# Download binary
$URL = "https://github.com/$REPO/releases/download/v$Version/springcraft-win.exe"
$TEMP_FILE = "$env:TEMP\springcraft_temp.exe"

Write-Host "Downloading from $URL..."
Invoke-WebRequest -Uri $URL -OutFile $TEMP_FILE -UseBasicParsing

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to download springcraft"
    exit 1
}

# Move to install directory
Move-Item -Path $TEMP_FILE -Destination "$INSTALL_DIR\$BIN_NAME" -Force

# Add to PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$INSTALL_DIR*") {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$INSTALL_DIR", "User")
    Write-Host "Added $INSTALL_DIR to PATH"
    Write-Host "Please restart your terminal or run: refreshenv"
}

Write-Host ""
Write-Host "Installed to $INSTALL_DIR\$BIN_NAME"
Write-Host ""
Write-Host "Run 'springcraft --help' to get started!"
