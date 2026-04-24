# Usage Guide

## Table of Contents

- [Installation](#installation)
- [Path-Based Scaffolding](#path-based-scaffolding)
- [Interactive Mode](#interactive-mode)
- [CLI Flags](#cli-flags)
- [Presets](#presets)
- [Dependency Selection](#dependency-selection)
- [Post-Scaffold Options](#post-scaffold-options)
- [Project Commands](#project-commands)
- [Adding Dependencies to Existing Project](#adding-dependencies-to-existing-project)
- [Adding Services to Project](#adding-services-to-project)
- [Compiling Services](#compiling-services)
- [Examples](#examples)

---

## Installation

### Arch Linux (AUR)

```bash
yay -S springcraft
# or
paru -S springcraft
```

### macOS / Linux (Homebrew)

```bash
brew tap fmitesh007/springcraft
brew install springcraft
```

### Windows (Scoop)

```powershell
scoop bucket add springcraft https://github.com/fmitesh007/scoop-springcraft
scoop install springcraft
```

### npm (Global)

```bash
npm install -g springcraft
```

### Manual Download

| Platform | Download |
|----------|----------|
| Linux | `springcraft-linux` |
| macOS | `springcraft-macos` |
| Windows | `springcraft-win.exe` |

From: https://github.com/fmitesh007/springcraft/releases/latest

```bash
# Linux
curl -sLO https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-linux
chmod +x springcraft-linux
sudo mv springcraft-linux /usr/local/bin/springcraft

# macOS
curl -sLO https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-macos
chmod +x springcraft-macos
sudo mv springcraft-macos /usr/local/bin/springcraft

# Windows (PowerShell)
irm https://github.com/fmitesh007/springcraft-cli/releases/latest/download/springcraft-win.exe -OutFile springcraft.exe
```

---

## Path-Based Scaffolding

The core concept: specify a path, and the project is created there.

### Create in Current Directory

```bash
springcraft .
```

Project files go into `./directory-name/`

### Create in Specific Directory

```bash
springcraft ~/projects/my-api
springcraft /path/to/any/directory
springcraft ./relative/path
```

### Auto-Create Directories

If the path doesn't exist, it's created automatically:

```bash
springcraft ~/projects/new-app
# Creates ~/projects/ if needed
# Creates ~/projects/new-app/ for the project
```

### Override Project Name

Use `--artifact-id` to specify a different project name than the directory:

```bash
springcraft ~/projects/api --artifact-id my-api-service
```

---

## Interactive Mode

Run without CLI flags to use the interactive prompts:

```bash
springcraft .
```

### Prompt Flow

1. **Dependency Mode** — Choose how to select dependencies
   - `Simple` — Quick checkbox selection (12 common deps)
   - `Detailed (FZF)` — Full searchable list with keyboard navigation
   - `None` — Skip dependencies

2. **Build Tool** — Maven or Gradle
   - `maven-project` — Maven project
   - `gradle-project` — Gradle (Groovy DSL)
   - `gradle-project-kotlin` — Gradle (Kotlin DSL)

3. **Language** — Java, Kotlin, or Groovy

4. **Spring Boot Version** — 3.5.0 (recommended), 3.4.5, 3.3.11, 3.2.12

5. **Java Version** — 17 (LTS, recommended), 21 (LTS), 11, 24

6. **Group ID** — e.g., `com.example`

7. **Package Name** — Auto-derived from Group ID + Artifact ID

8. **Description** — Project description

9. **Packaging** — Jar (recommended) or War

10. **Dependencies** — Based on mode selected in step 1

---

## CLI Flags

All options can be passed via CLI flags for full automation:

| Flag | Description | Example |
|------|-------------|---------|
| `.` | Use current directory | `springcraft .` |
| `/path` | Create in specific path | `springcraft ~/projects/api` |
| `--arch <fullstack\|backend-only>` | Project architecture | `--arch fullstack` |
| `--frontend <react\|vue\|svelte\|angular\|preact\|solid\|lit>` | Add frontend | `--frontend react` |
| `--build-tool <maven-project\|gradle-project\|gradle-project-kotlin>` | Build tool | `--build-tool maven-project` |
| `--language <java\|kotlin\|groovy>` | Language | `--language java` |
| `--java-version <ver>` | Java version (11/17/21/24) | `--java-version 17` |
| `--spring-boot-version <ver>` | Spring Boot version | `--spring-boot-version 3.5.0` |
| `--group-id <id>` | Group ID | `--group-id com.example` |
| `--artifact-id <id>` | Artifact ID | `--artifact-id my-app` |
| `--package-name <name>` | Package name | `--package-name com.example.myapp` |
| `--description "<text>"` | Project description | `--description "My project"` |
| `--packaging <jar\|war>` | Packaging type | `--packaging jar` |
| `--dependencies <list>` | Comma-separated deps | `--dependencies web,data-jpa,lombok` |
| `--dry-run` | Show URL without downloading | `--dry-run` |
| `--preset <name>` | Load saved preset | `--preset my-preset` |
| `--list-presets` | List saved presets | `--list-presets` |
| `--add-dep` | Add dependencies to existing project | `--add-dep` |
| `--add-service` | Add new microservice to project | `--add-service` |
| `--compile-service`, `--cs` | Compile a service | `--cs` |
| `--help`, `-h` | Show help | `--help` |
| `--version`, `-v` | Show version | `--version` |

### Flag-Based Example

```bash
springcraft . \
  --build-tool maven-project \
  --language java \
  --java-version 21 \
  --spring-boot-version 3.5.0 \
  --group-id com.mycompany \
  --artifact-id my-api \
  --description "REST API service" \
  --packaging jar \
  --dependencies web,data-jpa,security,validation,lombok,actuator
```

---

## Presets

Save your frequently used configurations for quick access.

### Saving a Preset

After scaffolding, you'll be prompted:

```
Save as preset? (leave blank to skip)
```

Enter a name to save. Presets are stored at `~/.springcraft/presets.json`.

### Using a Preset

```bash
springcraft . --preset fullstack
```

### List Available Presets

```bash
springcraft --list-presets
```

### Preset Format

```json
{
  "fullstack": {
    "buildTool": "maven-project",
    "language": "java",
    "javaVersion": "17",
    "springBootVersion": "3.5.0",
    "groupId": "com.example",
    "artifactId": "my-spring-app",
    "packageName": "com.example.app",
    "description": "Full stack Spring Boot application",
    "packaging": "jar",
    "dependencies": ["web", "data-jpa", "security", "lombok"]
  }
}
```

Note: Preset format uses camelCase field names internally.

---

## Dependency Selection

### Simple Mode

12 pre-selected common dependencies with checkbox UI:
- web, data-jpa, security, validation, lombok, devtools, actuator, h2, postgresql, thymeleaf, mail, cache

### FZF Mode

50+ dependencies organized by category:

| Category | Dependencies |
|----------|--------------|
| DEVTOOLS | devtools, lombok, docker-compose, spring-shell, configuration-processor |
| WEB | web, webflux, graphql, websocket, jersey, hateoas |
| TEMPLATE | thymeleaf, freemarker, mustache |
| SECURITY | security, oauth2-client, oauth2-resource-server, oauth2-authorization-server |
| SQL | data-jpa, jdbc, data-jdbc, mybatis, flyway, liquibase, h2, postgresql, mysql, mariadb, mssql, oracle |
| NOSQL | data-mongodb, data-redis, data-elasticsearch, data-cassandra, data-neo4j, data-couchbase |
| MESSAGING | amqp, kafka, kafka-streams, activemq, artemis |
| I/O | batch, mail, quartz, cache, validation, retry |
| OPS | actuator, prometheus, distributed-tracing, zipkin |
| TEST | testcontainers, restdocs |
| CLOUD | cloud-config-client, cloud-eureka, cloud-gateway, resilience4j, openfeign |

### FZF Controls

- `↑/↓` — Navigate
- `SPACE` — Toggle selection
- `ENTER` — Confirm
- `ESC` — Skip/finish
- `BACKSPACE` — Clear search
- Type to filter in real-time

---

## Post-Scaffold Options

After project creation, you'll be offered:

### Frontend Scaffolding

Add a frontend with Vite (all 7 frameworks supported):
- **React** — With Hooks
- **Vue** — With Composition API
- **Svelte** — Reactive framework
- **Angular** — Full Angular CLI setup
- **Preact** — Lightweight React alternative
- **Solid** — Fine-grained reactivity
- **Lit** — Web Components

Each frontend comes with a **Terminal UI Dashboard** featuring:
- Identity resolver (API testing)
- JSON response viewer with syntax highlighting
- API endpoints display
- Client routes panel
- Health check indicator

### Docker Compose

Automatically generated for selected databases:
- PostgreSQL (port 5432)
- MySQL (port 3306)
- MariaDB (port 3306)
- SQL Server (port 1433)
- MongoDB (port 27017)
- Redis (port 6379)
- Elasticsearch (port 9200)

### Environment Variables

Auto-generated `.env` and `.env.example` based on selected dependencies:

| Dependency | Variables |
|------------|-----------|
| postgresql | `SPRING_DATASOURCE_URL`, `DB_USER`, `DB_PASS` |
| mysql/mariadb | `SPRING_DATASOURCE_URL`, `DB_USER`, `DB_PASS` |
| data-jpa/jdbc | `SPRING_DATASOURCE_URL`, `DB_USER`, `DB_PASS` |
| data-redis | `REDIS_HOST`, `REDIS_PORT` |
| security | `JWT_SECRET`, `JWT_EXPIRATION` |
| mail | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` |
| kafka | `KAFKA_BOOTSTRAP_SERVERS` |
| amqp | `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASS` |

### Git Initialization

- Runs `git init`
- Creates `.gitignore` with sensible defaults
- Commits initial files

---

## Examples

### Minimal REST API

```bash
springcraft . --build-tool maven-project --language java --java-version 17 --spring-boot-version 3.5.0 --dependencies web,validation
```

### Full-Stack with PostgreSQL

```bash
springcraft ~/projects/api \
  --build-tool maven-project \
  --language java \
  --java-version 21 \
  --spring-boot-version 3.5.0 \
  --group-id com.mycompany \
  --artifact-id my-api \
  --dependencies web,data-jpa,security,lombok,postgresql,devtools,actuator
```

### Microservice

```bash
springcraft ~/projects/user-service \
  --build-tool gradle-project-kotlin \
  --language kotlin \
  --java-version 21 \
  --spring-boot-version 3.5.0 \
  --group-id com.mycompany \
  --dependencies webflux,data-redis,security,actuator,cloud-eureka
```

### React Full-Stack

```bash
springcraft ~/projects/react-spring \
  --build-tool maven-project \
  --language java \
  --java-version 17 \
  --spring-boot-version 3.5.0 \
  --group-id com.mycompany \
  --artifact-id react-spring \
  --dependencies web,data-jpa,security \
  --frontend react
```

---

## Project Commands

After scaffolding, `springcraft.json` is created in your project directory. These commands work from within a springcraft project.

### Running the Project

```bash
springcraft --run
```

Run backend only (Spring Boot).

```bash
springcraft --run --frontend
```

Run frontend dev server only (requires frontend scaffolding).

```bash
springcraft --run --dev
```

Run both backend and frontend concurrently.

### Building

```bash
springcraft --build
```

Build the project (runs Maven/Gradle build command).

```bash
springcraft --build --prod
```

Production build:
1. Build frontend (if present) and copy to `src/main/resources/static/`
2. Package the application as jar

### Docker Services

```bash
springcraft --docker up
```

Start Docker services defined in `docker-compose.yml`.

```bash
springcraft --docker down
```

Stop Docker services.

```bash
springcraft --docker logs
```

View Docker logs (follows output).

### Project Info

```bash
springcraft --info
```

Display project configuration including services:

```
╭─ Project Info ─────────────────────────╮
│ Name:         my-app                   │
│ Architecture: fullstack                │
│ Build Tool:   Maven                   │
│ Language:     Java 17                 │
│ Spring Boot:  3.5.0                   │
│ Frontend:     React (frontend/)       │
│ Services:     user, order, product    │
│ Run:          ./mvnw spring-boot:run  │
│ Build:        ./mvnw clean package    │
╰────────────────────────────────────────╯
```

---

## Adding Dependencies to Existing Project

Add dependencies to an existing Spring Boot project:

```bash
cd my-existing-project
springcraft --add-dep
```

### Dependency Sources

1. **Spring Initializr** — Official Spring Boot starters (FZF-style search)
2. **Maven Central** — Any Maven artifact (requires coordinates)

### FZF Search Controls

- `↑/↓` — Navigate
- `SPACE` — Toggle selection
- `ENTER` — Confirm
- `ESC` — Skip/finish
- `BACKSPACE` — Clear search
- Type to filter in real-time

---

## Adding Services to Project

Add a complete microservice to your project:

```bash
cd my-project
springcraft --add-service
```

### What Gets Created

For each service, the following structure is generated:

```
src/main/java/{groupId}/{serviceName}/
├── model/
│   └── {ServiceName}.java          # JPA Entity
├── repository/
│   └── {ServiceName}Repository.java # Spring Data JPA
├── service/
│   └── {ServiceName}Service.java   # Business logic
├── controller/
│   └── {ServiceName}Controller.java # REST endpoints
├── dto/
│   ├── {ServiceName}Request.java   # Request DTO
│   └── {ServiceName}Response.java  # Response DTO
└── config/
    └── {ServiceName}Config.java    # Configuration
```

### After Creation

- Automatic compilation prompt
- API endpoint: `/api/{serviceName}`

---

## Compiling Services

Compile services in your project:

```bash
springcraft --compile-service
```

Or use short alias:

```bash
springcraft --cs
```

If multiple services exist, you'll be prompted to select which one to compile.

---

## Troubleshooting

### "Permission denied" on npm link

```bash
sudo npm link
```

Or configure npm to use a user directory:

```bash
npm config set prefix ~/.npm-global
npm link
export PATH="$PATH:$(npm config get prefix)/bin"
```

### Java version not supported

Ensure you have the correct Java version installed:

```bash
java -version
```

Update the `--java-version` flag to match your installed version.

### Spring Boot version not available

The specified version may be too old. Try:

```bash
--boot 3.5.0
```

### Preset not found

Check your presets file:

```bash
cat ~/.springcraft/presets.json
```

### TTY initialization failed

This occurs when running in non-interactive environments (CI/CD, scripts). Use `--dry-run` to verify the URL:

```bash
springcraft . --dry-run
```
