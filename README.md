# create-spring-app

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
- 🎨 **Frontend Scaffolding** — Add React, Vue, Svelte, SolidJS, or Angular in one step
- 🗄️ **Git Initialization** — Automatic git setup with sensible defaults

## Quick Start

### Interactive Mode

```bash
npx create-spring-app my-spring-app
```

### Current Directory

```bash
cd my-directory
create-spring-app .
```

### Automated Mode

```bash
create-spring-app my-app --maven --java --java-version 17 --boot 3.5.0 --deps web,data-jpa,lombok
```

## Installation

### From npm (global)

```bash
npm install -g create-spring-app
```

### From source

```bash
git clone <repository-url>
cd create-spring-app
npm install
npm link
```

## Usage

See [USAGE.md](./USAGE.md) for detailed documentation.

## Project Structure

```
create-spring-app/
├── bin/
│   └── index.js          # CLI entry point
├── src/
│   ├── prompts.js        # Interactive prompts & FZF search
│   ├── downloader.js     # Spring Initializr API client
│   ├── extractor.js      # ZIP extraction
│   ├── generator.js      # Orchestration
│   ├── presets.js        # Preset management
│   └── postscaffold.js   # Post-scaffold actions
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
