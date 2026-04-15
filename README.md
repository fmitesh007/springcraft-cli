# springcraft

> A modern CLI scaffolder for Spring Boot projects — inspired by Vite's developer experience.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Interactive CLI** — Beautiful prompts powered by `@clack/prompts`
- 🔍 **FZF-style Search** — Fuzzy search through 50+ Spring Boot dependencies
- ⚡ **Quick Select** — Pre-configured common dependencies for fast scaffolding
- 🐳 **Docker Compose** — Auto-generate `docker-compose.yml` for selected databases
- 📝 **Environment Variables** — Auto-generate `.env` and `.env.example`
- 📖 **Smart README** — Auto-generated project documentation
- 🔧 **Presets** — Save and reuse your favorite configurations
- 🏷️ **CLI Flags** — Full automation support for CI/CD pipelines
- 🎨 **Frontend Scaffolding** — Add React, Vue, Svelte, Angular, Preact, Solid, or Lit in one step
- 🖥️ **Terminal UI** — Beautiful developer dashboard with health checks and API exploration
- 🗄️ **Git Initialization** — Automatic git setup with sensible defaults
- 📁 **Path Support** — Create projects in any directory, auto-creates if needed

## Quick Start

### Interactive Mode

```bash
springcraft .
```

### Create in Specific Directory

```bash
springcraft ~/projects/my-api
springcraft /path/to/any/directory
```

### Automated Mode

```bash
springcraft . --maven --java --java-version 17 --deps web,data-jpa,lombok
```

## Installation

### Arch Linux (AUR)

```bash
# Using yay or paru
yay -S springcraft
# or
paru -S springcraft
```

### macOS/Linux (Homebrew) (under maintenance)

```bash
brew tap fmitesh007/springcraft
brew install springcraft
```

### Linux

```bash
curl -sSL https://raw.githubusercontent.com/fmitesh007/springcraft-cli/main/scripts/install.sh | bash
```

### MacOS

```bash
curl -sSL https://raw.githubusercontent.com/fmitesh007/springcraft-cli/main/scripts/install.sh | bash
```

### Windows (powershell)

```powershell
irm https://raw.githubusercontent.com/fmitesh007/springcraft-cli/main/scripts/install.ps1 | iex
```

### Manual Download

```bash
# Linux
curl -sLO https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-linux
chmod +x springcraft-linux
sudo mv springcraft-linux /usr/local/bin/springcraft

# macOS
curl -sLO https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-macos
chmod +x springcraft-macos
sudo mv springcraft-macos /usr/local/bin/springcraft

# Windows
irm https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-win.exe -OutFile springcraft.exe
```

### From npm (requires Node.js) (under maintenance)

```bash
npm install -g springcraft
```

### From source (requires Node.js)

```bash
git clone https://github.com/fmitesh007/springcraft-cli.git
cd springcraft-cli
npm install
npm link
```

## Usage

See [USAGE.md](./USAGE.md) for detailed documentation.

## Project Structure

```
springcraft/
├── bin/
│   └── index.js          # CLI entry point
├── src/
│   ├── cli/              # CLI entry & flag parsing
│   │   ├── index.js
│   │   └── flags.js
│   ├── core/             # Core orchestration
│   │   ├── generator.js
│   │   ├── downloader.js
│   │   └── extractor.js
│   ├── prompts/          # Interactive prompts
│   │   ├── index.js
│   │   ├── project.js
│   │   └── dependencies.js
│   ├── scaffold/         # Post-scaffold actions
│   │   ├── index.js
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── docker.js
│   │   ├── env.js
│   │   ├── git.js
│   │   └── readme.js
│   ├── commands/          # Runtime commands
│   │   ├── index.js
│   │   ├── run.js
│   │   ├── build.js
│   │   ├── docker.js
│   │   └── info.js
│   └── shared/           # Shared utilities
│       ├── index.js
│       ├── config.js
│       ├── errors.js
│       ├── routes.js
│       ├── styles.js
│       └── utils.js
├── package.json
├── README.md
└── USAGE.md
```

## Tech Stack

- **Node.js 18+** (ESM modules)
- **@clack/prompts** — Interactive CLI UI
- **fs-extra** — Filesystem operations
- **unzipper** — ZIP extraction
- **Native fetch** — HTTP requests (no external dependencies)

## Supported Options

| Option | Values |
|--------|--------|
| Build Tool | Maven, Gradle (Groovy DSL), Gradle (Kotlin DSL) |
| Language | Java, Kotlin, Groovy |
| Java Version | 11, 17 (LTS), 21 (LTS), 24 |
| Spring Boot | 3.2.12, 3.3.11, 3.4.5, 3.5.0 |
| Packaging | Jar, War |
| Dependencies | 50+ including web, data-jpa, security, etc. |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License — see [LICENSE](LICENSE) for details.
