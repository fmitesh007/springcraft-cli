# Usage Guide

## Table of Contents

- [Interactive Mode](#interactive-mode)
- [CLI Flags](#cli-flags)
- [Presets](#presets)
- [Dependency Selection](#dependency-selection)
- [Post-Scaffold Options](#post-scaffold-options)
- [Examples](#examples)

---

## Interactive Mode

Run without any flags to use the interactive prompts:

```bash
create-spring-app my-spring-app
```

### Create in Current Directory

Use `.` to scaffold a project in the current directory:

```bash
cd my-directory
create-spring-app .
```

The directory name is used as the project name. Use `--artifact` to override:</p>

```bash
create-spring-app . --artifact my-custom-name
```

### Prompt Flow

1. **Dependency Mode** — Choose how to select dependencies
   - `Simple` — Quick checkbox selection (12 common deps)
   - `Detailed (FZF)` — Full searchable list with keyboard navigation
   - `None` — Skip dependencies

2. **Build Tool** — Maven or Gradle (Groovy/Kotlin DSL)

3. **Language** — Java, Kotlin, or Groovy

4. **Spring Boot Version** — 3.5.0 (recommended), 3.4.5, 3.3.11, 3.2.12

5. **Java Version** — 17 (LTS, recommended), 21 (LTS), 11, 24

6. **Group ID** — e.g., `com.example`

7. **Artifact ID** — e.g., `my-spring-app`

8. **Package Name** — Auto-derived from Group ID + Artifact ID

9. **Description** — Project description

10. **Packaging** — Jar (recommended) or War

11. **Dependencies** — Based on mode selected in step 1

---

## CLI Flags

All options can be passed via CLI flags for full automation:

| Flag | Description | Example |
|------|-------------|---------|
| `--help`, `-h` | Show help | `--help` |
| `--version`, `-v` | Show version | `--version` |
| `.` | Use current directory | `create-spring-app .` |
| `--maven` | Use Maven build tool | `--maven` |
| `--gradle` | Use Gradle (Groovy DSL) | `--gradle` |
| `--gradle-kotlin` | Use Gradle (Kotlin DSL) | `--gradle-kotlin` |
| `--java` | Java language | `--java` |
| `--kotlin` | Kotlin language | `--kotlin` |
| `--groovy` | Groovy language | `--groovy` |
| `--java-version <ver>` | Java version (11/17/21/24) | `--java-version 17` |
| `--boot <ver>` | Spring Boot version | `--boot 3.5.0` |
| `--group <id>` | Group ID | `--group com.example` |
| `--artifact <id>` | Artifact ID | `--artifact my-app` |
| `--package <name>` | Package name | `--package com.example.myapp` |
| `--desc "<text>"` | Project description | `--desc "My project"` |
| `--jar` | Jar packaging | `--jar` |
| `--war` | War packaging | `--war` |
| `--deps <list>` | Comma-separated deps | `--deps web,data-jpa,lombok` |
| `--dry-run` | Show URL without downloading | `--dry-run` |
| `--preset <name>` | Load saved preset | `--preset my-preset` |
| `--list-presets` | List saved presets | `--list-presets` |

### Flag-Based Example

```bash
create-spring-app my-api \
  --maven \
  --java \
  --java-version 21 \
  --boot 3.5.0 \
  --group com.mycompany \
  --artifact my-api \
  --desc "REST API service" \
  --jar \
  --deps web,data-jpa,security,validation,lombok,actuator
```

---

## Presets

Save your frequently used configurations for quick access.

### Saving a Preset

After scaffolding, you'll be prompted:

```
Save as preset? (leave blank to skip)
```

Enter a name to save. Presets are stored at `~/.create-spring-app/presets.json`.

### Using a Preset

```bash
create-spring-app new-api --preset my-api-preset
```

### Preset Format

```json
{
  "my-preset": {
    "buildTool": "maven-project",
    "language": "java",
    "javaVersion": "21",
    "springBootVersion": "3.5.0",
    "groupId": "com.example",
    "artifactId": "demo",
    "packageName": "com.example.demo",
    "description": "Demo project",
    "packaging": "jar",
    "dependencies": ["web", "data-jpa", "lombok"]
  }
}
```

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

Add a frontend with Vite, Svelte, or Angular:
- React (JavaScript)
- React (TypeScript)
- Vue
- Svelte
- SolidJS
- Angular

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

### Editor Launch

Open project directly in:
- VS Code
- Zed
- IntelliJ IDEA
- Cursor

---

## Examples

### Minimal REST API

```bash
create-spring-app rest-api --maven --java --java-version 17 --boot 3.5.0 --deps web,validation
```

### Full-Stack with PostgreSQL

```bash
create-spring-app fullstack-app \
  --gradle \
  --java \
  --java-version 21 \
  --boot 3.5.0 \
  --group com.mycompany \
  --artifact fullstack-app \
  --deps web,data-jpa,security,lombok,postgresql,devtools,actuator
```

### Microservice

```bash
create-spring-app user-service \
  --gradle-kotlin \
  --kotlin \
  --java-version 21 \
  --boot 3.5.0 \
  --group com.mycompany \
  --artifact user-service \
  --deps webflux,data-redis,security,actuator,cloud-eureka
```

### React Full-Stack

```bash
create-spring-app react-spring \
  --maven \
  --java \
  --java-version 17 \
  --boot 3.5.0 \
  --deps web,data-jpa,security,thymeleaf
```

(Then select React frontend during post-scaffold prompts)

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
cat ~/.create-spring-app/presets.json
```

### TTY initialization failed

This occurs when running in non-interactive environments (CI/CD, scripts). Use `--dry-run` to verify the URL, or pipe input:

```bash
echo -e "\n\n" | create-spring-app my-app
```
