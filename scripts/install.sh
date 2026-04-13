#!/bin/bash
set -e

REPO="fmitesh007/springcraft-cli"
INSTALL_DIR="${HOME}/.local/bin"
BIN_NAME="springcraft"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    FILENAME="springcraft-macos"
else
    FILENAME="springcraft-linux"
fi

# Detect architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
    echo "ARM64 detected. Note: Binary may not be available for ARM64."
fi

# Get latest version
VERSION=$(curl -s https://api.github.com/repos/${REPO}/releases/latest | grep -o '"tag_name": "v[^"]*' | cut -d'"' -f4)
VERSION=${VERSION#v}

if [ -z "$VERSION" ]; then
    VERSION="0.2.0"
    echo "Could not detect latest version, using $VERSION"
fi

echo "Installing springcraft v${VERSION}..."

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download binary
TEMP_FILE=$(mktemp)
curl -sL "https://github.com/${REPO}/releases/download/v${VERSION}/${FILENAME}" -o "$TEMP_FILE"

if [ $? -ne 0 ]; then
    echo "Error: Failed to download springcraft"
    exit 1
fi

# Make executable and install
chmod +x "$TEMP_FILE"
mv "$TEMP_FILE" "${INSTALL_DIR}/${BIN_NAME}"

# Add to PATH if not already there
SHELL_RC="${HOME}/.bashrc"
if [[ ":${PATH}:" != *":${INSTALL_DIR}:"* ]]; then
    echo "" >> "$SHELL_RC"
    echo "# Added by springcraft installer" >> "$SHELL_RC"
    echo "export PATH=\"\${HOME}/.local/bin:\${PATH}\"" >> "$SHELL_RC"
    echo "export PATH=\"\${HOME}/.local/bin:\${PATH}\" added to ${SHELL_RC}"
    echo "Please run 'source ${SHELL_RC}' or restart your terminal"
fi

echo "Installed to ${INSTALL_DIR}/${BIN_NAME}"
echo ""
echo "Run 'springcraft --help' to get started!"
