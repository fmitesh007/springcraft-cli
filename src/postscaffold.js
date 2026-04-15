import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const DB_DEPS = ['postgresql', 'mysql', 'mariadb', 'mssql', 'data-mongodb', 'data-redis', 'data-elasticsearch'];

function hasDbDep(dependencies) {
  return dependencies?.some(d => DB_DEPS.includes(d));
}

function yamlStringify(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      lines.push(yamlStringify(value, indent + 1));
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${pad}${key}: []`);
      } else {
        lines.push(`${pad}${key}:`);
        for (const item of value) {
          if (typeof item === 'object') {
            lines.push(`${pad}  - ${yamlStringify(item, indent + 2).trim()}`);
          } else {
            lines.push(`${pad}  - ${item}`);
          }
        }
      }
    } else {
      lines.push(`${pad}${key}: ${value}`);
    }
  }
  return lines.join('\n');
}

async function askFrontend(projectDir, answers) {
  if (answers.arch === 'backend-only') {
    p.log.info('Skipping frontend (backend-only architecture).');
    return { scaffolded: false, stack: null };
  }

  const choice = answers.frontend || (await p.select({
    message: 'Add a frontend?',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'angular', label: 'Angular' },
      { value: 'none', label: 'None' },
    ],
  }));

  if (p.isCancel(choice) || choice === 'none') {
    return { scaffolded: false, stack: null };
  }

  if (choice === 'angular') {
    try {
      p.log.step('Running: npx @angular/cli new frontend');
      execSync('npx @angular/cli new frontend --skip-git --skip-tests --style css --ssr=false', { cwd: projectDir, stdio: 'inherit' });
      p.log.success('Angular frontend scaffolded.');
      return { scaffolded: true, stack: 'Angular' };
    } catch (e) {
      p.log.warn('Angular scaffolding failed. Install manually if needed.');
      return { scaffolded: false, stack: null };
    }
  }

  // Map our choice to Vite template name
  const templateMap = {
    react: 'react',
    vue: 'vue',
    svelte: 'svelte',
    lit: 'lit',
    preact: 'preact',
    solid: 'solid',
  };

  const template = templateMap[choice];
  const stackName = choice.charAt(0).toUpperCase() + choice.slice(1);

  try {
    p.log.step(`Running: npm create vite@latest frontend -- --template ${template} --no-interactive`);
    execSync(`npm create vite@latest frontend -- --template ${template} --no-interactive`, { cwd: projectDir, stdio: 'inherit' });
    p.log.success(`${stackName} frontend scaffolded.`);

    // Install dependencies separately (--no-interactive doesn't auto-install)
    p.log.step('Installing frontend dependencies...');
    execSync('npm install', { cwd: path.join(projectDir, 'frontend'), stdio: 'inherit' });
    p.log.success('Frontend dependencies installed.');

    const stack = detectFrontendStack(projectDir);
    await configureViteProxy(projectDir);
    await generateHelloUI(projectDir);
    return { scaffolded: true, stack };
  } catch (e) {
    p.log.warn('Frontend scaffolding failed. Install manually if needed.');
    return { scaffolded: false, stack: null };
  }
}

function detectFrontendStack(projectDir) {
  try {
    const pkgPath = path.join(projectDir, 'frontend', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.dependencies?.react) return 'React';
      if (pkg.dependencies?.vue) return 'Vue';
      if (pkg.dependencies?.svelte) return 'Svelte';
      if (pkg.dependencies?.['@angular/core']) return 'Angular';
    }
  } catch (e) {}
  return 'Vite';
}

async function configureViteProxy(projectDir) {
  const viteConfigPath = path.join(projectDir, 'frontend', 'vite.config.js');

  if (!fs.existsSync(viteConfigPath)) {
    p.log.warn('vite.config.js not found, skipping proxy configuration.');
    return;
  }

  const proxyConfig = `
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },`;

  try {
    let config = await fs.readFile(viteConfigPath, 'utf-8');

    if (config.includes('proxy:')) {
      p.log.info('Proxy config already exists in vite.config.js');
      return;
    }

    config = config.replace(
      /export default defineConfig\(\{/,
      `export default defineConfig({${proxyConfig}`
    );

    await fs.writeFile(viteConfigPath, config);
    p.log.success('Vite proxy configured: /api → http://localhost:8080');
  } catch (e) {
    p.log.warn('Could not configure Vite proxy. Configure manually if needed.');
  }
}

async function generateDockerCompose(projectDir, answers) {
  const deps = answers.dependencies || [];
  const matchingDbs = deps.filter(d => DB_DEPS.includes(d));

  if (matchingDbs.length === 0) return;

  const confirm = await p.confirm({
    message: 'Generate docker-compose.yml for local dev?',
    initialValue: true,
  });

  if (!confirm) return;

  const services = {};
  const ports = { postgresql: 5432, mysql: 3306, mariadb: 3306, mssql: 1433, 'data-mongodb': 27017, 'data-redis': 6379, 'data-elasticsearch': 9200 };
  const images = { postgresql: 'postgres:16', mysql: 'mysql:8', mariadb: 'mariadb:11', mssql: 'mcr.microsoft.com/mssql/server:2022-latest', 'data-mongodb': 'mongo:7', 'data-redis': 'redis:7-alpine', 'data-elasticsearch': 'elasticsearch:8.13.0' };

  for (const db of matchingDbs) {
    const port = ports[db];
    const image = images[db];
    const svcName = db.replace('data-', '');
    services[svcName] = { image, ports: [`${port}:${port}`] };

    if (db === 'postgresql') {
      services[svcName].environment = ['POSTGRES_DB=dbname', 'POSTGRES_USER=postgres', 'POSTGRES_PASSWORD=secret'];
      services[svcName].volumes = ['postgres_data:/var/lib/postgresql/data'];
    } else if (db === 'mysql') {
      services[svcName].environment = ['MYSQL_DATABASE=dbname', 'MYSQL_USER=user', 'MYSQL_PASSWORD=secret', 'MYSQL_ROOT_PASSWORD=rootsecret'];
    } else if (db === 'mariadb') {
      services[svcName].environment = ['MARIADB_DATABASE=dbname', 'MARIADB_USER=user', 'MARIADB_PASSWORD=secret', 'MARIADB_ROOT_PASSWORD=rootsecret'];
    } else if (db === 'mssql') {
      services[svcName].environment = ['ACCEPT_EULA=Y', 'MSSQL_SA_PASSWORD=YourStrong@Password'];
    } else if (db === 'data-elasticsearch') {
      services[svcName].environment = ['discovery.type=single-node', 'xpack.security.enabled=false'];
      services[svcName].volumes = ['es_data:/usr/share/elasticsearch/data'];
    } else if (db === 'data-redis') {
      // redis uses default config, no extra env
    } else if (db === 'data-mongodb') {
      services[svcName].volumes = ['mongo_data:/data/db'];
    }
  }

  if (Object.keys(services).some(s => services[s].volumes)) {
    services.volumes = {};
    for (const db of matchingDbs) {
      const svcName = db.replace('data-', '');
      if (services[svcName]?.volumes) {
        const volName = svcName === 'postgres' ? 'postgres_data' : svcName === 'elasticsearch' ? 'es_data' : svcName === 'mongodb' ? 'mongo_data' : null;
        if (volName) services.volumes[volName] = null;
      }
    }
    if (Object.keys(services.volumes).length === 0) delete services.volumes;
  }

  const dockerCompose = { version: '3.8', services, volumes: services.volumes || undefined };
  await fs.outputFile(path.join(projectDir, 'docker-compose.yml'), yamlStringify(dockerCompose));
  p.log.success('docker-compose.yml generated.');
}

async function generateEnvFiles(projectDir, answers) {
  const deps = answers.dependencies || [];
  const lines = [];
  const exampleLines = [];

  if (deps.includes('postgresql')) {
    lines.push('SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/dbname', 'DB_USER=postgres', 'DB_PASS=secret');
    exampleLines.push('SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS=');
  } else if (deps.includes('mysql')) {
    lines.push('SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/dbname', 'DB_USER=root', 'DB_PASS=secret');
    exampleLines.push('SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS=');
  } else if (deps.includes('mariadb')) {
    lines.push('SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3306/dbname', 'DB_USER=root', 'DB_PASS=secret');
    exampleLines.push('SPRING_DAaTASOURCE_URL=', 'DB_USER=', 'DB_PASS=');
  } else if (deps.includes('data-jpa') || deps.includes('jdbc')) {
    lines.push('SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb', 'DB_USER=sa', 'DB_PASS=');
    exampleLines.push('SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS=');
  }

  if (deps.includes('data-redis')) {
    lines.push('REDIS_HOST=localhost', 'REDIS_PORT=6379');
    exampleLines.push('REDIS_HOST=', 'REDIS_PORT=');
  }

  if (deps.includes('security')) {
    lines.push('JWT_SECRET=changeme_use_a_long_random_string', 'JWT_EXPIRATION=86400000');
    exampleLines.push('JWT_SECRET=', 'JWT_EXPIRATION=');
  }

  if (deps.includes('mail')) {
    lines.push('MAIL_HOST=smtp.gmail.com', 'MAIL_PORT=587', 'MAIL_USER=', 'MAIL_PASS=');
    exampleLines.push('MAIL_HOST=', 'MAIL_PORT=', 'MAIL_USER=', 'MAIL_PASS=');
  }

  if (deps.includes('kafka')) {
    lines.push('KAFKA_BOOTSTRAP_SERVERS=localhost:9092');
    exampleLines.push('KAFKA_BOOTSTRAP_SERVERS=');
  }

  if (deps.includes('amqp')) {
    lines.push('RABBITMQ_HOST=localhost', 'RABBITMQ_PORT=5672', 'RABBITMQ_USER=guest', 'RABBITMQ_PASS=guest');
    exampleLines.push('RABBITMQ_HOST=', 'RABBITMQ_PORT=', 'RABBITMQ_USER=', 'RABBITMQ_PASS=');
  }

  if (lines.length > 0) {
    await fs.outputFile(path.join(projectDir, '.env'), lines.join('\n') + '\n');
    await fs.outputFile(path.join(projectDir, '.env.example'), exampleLines.join('\n') + '\n');
    p.log.success('.env and .env.example generated.');
  }
}

async function generateReadme(projectDir, answers) {
  const runCommand = answers.buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run';
  const buildTool = answers.buildTool?.includes('maven') ? 'Maven' : (answers.buildTool?.includes('kotlin') ? 'Gradle Kotlin DSL' : 'Gradle Groovy DSL');
  const language = answers.language || 'Java';

  const deps = answers.dependencies || [];

  const depCategories = {
    web: ['web', 'webflux', 'graphql', 'websocket', 'jersey', 'hateoas'],
    data: ['data-jpa', 'jdbc', 'data-jdbc', 'mybatis', 'flyway', 'liquibase'],
    db: ['h2', 'postgresql', 'mysql', 'mariadb', 'mssql', 'oracle', 'data-mongodb', 'data-redis', 'data-elasticsearch', 'data-cassandra', 'data-neo4j', 'data-couchbase'],
    security: ['security', 'oauth2-client', 'oauth2-resource-server', 'oauth2-authorization-server'],
    messaging: ['amqp', 'kafka', 'kafka-streams', 'activemq', 'artemis'],
    devtools: ['devtools', 'lombok', 'docker-compose', 'spring-shell', 'configuration-processor'],
    ops: ['actuator', 'prometheus', 'distributed-tracing', 'zipkin'],
    io: ['batch', 'mail', 'quartz', 'cache', 'validation', 'retry'],
    cloud: ['cloud-config-client', 'cloud-eureka', 'cloud-gateway', 'resilience4j', 'openfeign'],
  };

  const categoryNames = {
    web: '🌐 Web',
    data: '🗄️ Data Access',
    db: '💾 Databases',
    security: '🔐 Security',
    messaging: '📨 Messaging',
    devtools: '🛠️ Developer Tools',
    ops: '📊 Operations',
    io: '⚡ I/O',
    cloud: '☁️ Cloud',
  };

  let depsByCategory = {};
  for (const [cat, catDeps] of Object.entries(depCategories)) {
    const matched = deps.filter(d => catDeps.includes(d));
    if (matched.length > 0) {
      depsByCategory[categoryNames[cat]] = matched;
    }
  }

  const hasDocker = deps.some(d => DB_DEPS.includes(d));
  const hasFrontend = fs.existsSync(path.join(projectDir, 'frontend'));
  const hasEnvVars = deps.some(d => ['postgresql', 'mysql', 'mariadb', 'h2', 'data-jpa', 'jdbc', 'data-redis', 'security', 'mail', 'kafka', 'amqp'].includes(d));

  let depsSection = '';
  if (Object.keys(depsByCategory).length > 0) {
    depsSection = Object.entries(depsByCategory)
      .map(([cat, catDeps]) => `| ${cat} | ${catDeps.join(', ')} |`)
      .join('\n');
    depsSection = `\n## 📦 Dependencies\n\n| Category | Dependencies |\n|---|---|\n${depsSection}`;
  }

  let dockerSection = '';
  if (hasDocker) {
    dockerSection = `
## 🐳 Local Services

\`\`\`bash
docker-compose up -d
\`\`\`

Start local databases and services defined in \`docker-compose.yml\`.`;
  }

  let envSection = '';
  if (hasEnvVars) {
    envSection = `
## 🔧 Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

See [.env.example](.env.example) for all available variables.`;
  }

  let frontendSection = '';
  if (hasFrontend) {
    const frontendDeps = fs.readFileSync(path.join(projectDir, 'frontend', 'package.json'), 'utf-8');
    let frontendType = 'Frontend';
    try {
      const pkg = JSON.parse(frontendDeps);
      if (pkg.dependencies?.react) frontendType = 'React';
      else if (pkg.dependencies?.vue) frontendType = 'Vue';
      else if (pkg.dependencies?.svelte) frontendType = 'Svelte';
      else if (pkg.dependencies?.['solid-js']) frontendType = 'SolidJS';
      else if (pkg.dependencies?.['@angular/core']) frontendType = 'Angular';
    } catch {}
    frontendSection = `
## ⚛️ ${frontendType} Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\``;
  }

  const content = `# ${answers.artifactId}

> ${answers.description || 'A Spring Boot application'}

${depsSection}

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Spring Boot ${answers.springBootVersion || '3.5.0'} |
| **Language** | ${language} |
| **Java Version** | ${answers.javaVersion || '17'} |
| **Build Tool** | ${buildTool} |
| **Packaging** | ${answers.packaging === 'war' ? 'War' : 'Jar'} |

## 📋 Prerequisites

- Java ${answers.javaVersion || '17'}
- ${buildTool} (or use wrapper: \`./mvnw\` / \`./gradlew\`)
${hasDocker ? '- Docker & Docker Compose' : ''}
${hasFrontend ? '- Node.js 18+ (for frontend)' : ''}

## 🚀 Getting Started

\`\`\`bash
# Build the project
${answers.buildTool?.includes('maven') ? './mvnw clean package' : './gradlew build'}

# Run the application
${runCommand}
\`\`\`
${hasFrontend ? `
## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/api/hello\` | GET | Hello world message |
| \`/api/health\` | GET | Health check |
\`\`\`bash
curl http://localhost:8080/api/hello
\`\`\`
` : ''}
${hasDocker}${envSection}${frontendSection}

## 📁 Project Structure

\`\`\`
.
├── src/main/java     # Java source code
├── src/main/resources # Configuration files
├── src/test         # Test files
├── frontend/        # Frontend application${hasDocker ? '\n├── docker-compose.yml # Local services' : ''}
└── pom.xml         # Maven configuration
\`\`\`

---

<p align="center">
  Built with ❤️ using <a href="https://github.com/yourrepo/springcraft">SpringCraft</a>
</p>
`;

  await fs.outputFile(path.join(projectDir, 'README.md'), content);
  p.log.success('README.md generated.');
}

async function initGit(projectDir, answers) {
  const confirm = await p.confirm({
    message: 'Initialize git repository?',
    initialValue: true,
  });

  if (!confirm) return;

  try {
    execSync('git init', { cwd: projectDir, stdio: 'pipe' });

    const gitignorePath = path.join(projectDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      await fs.outputFile(gitignorePath, `target/
.gradle/
build/
.env
*.class
.idea/
*.iml
node_modules/
frontend/dist/
*.log
.DS_Store
`);
    }

    execSync('git add .', { cwd: projectDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit via springcraft"', { cwd: projectDir, stdio: 'pipe' });
    p.log.success('Git repository initialized.');
  } catch (e) {
    p.log.warn('Git initialization failed. Initialize manually if needed.');
  }
}

async function openInEditor(projectDir) {
  const choice = await p.select({
    message: 'Open project in editor?',
    options: [
      { value: 'skip', label: 'Skip' },
      { value: 'vscode', label: 'VS Code' },
      { value: 'zed', label: 'Zed' },
      { value: 'idea', label: 'IntelliJ IDEA' },
      { value: 'cursor', label: 'Cursor' },
    ],
  });

  if (p.isCancel(choice) || choice === 'skip') return;

  const commands = {
    vscode: 'code .',
    zed: 'zed .',
    idea: 'idea .',
    cursor: 'cursor .',
  };

  const cmd = commands[choice];
  if (cmd) {
    try {
      execSync(cmd, { cwd: projectDir, stdio: 'inherit' });
    } catch (e) {
      p.log.warn(`Editor "${choice}" not found. Open manually: cd ${projectDir}`);
    }
  }
}

// ============================================================
// Hello UI Generator - Replaces Vite's dummy counter
// ============================================================

const HELLO_UI_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 100vh;
    color: #e4e4e7;
  }
  .container { 
    max-width: 800px; 
    margin: 0 auto; 
    padding: 2rem; 
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, #6ee7b7, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }
  .header p {
    color: #a1a1aa;
  }
  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1rem;
    padding: 1.5rem;
  }
  .card h2 {
    font-size: 1rem;
    color: #a1a1aa;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 0.5rem;
    background: rgba(255,255,255,0.05);
    color: #fff;
    font-size: 1rem;
  }
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
  }
  .btn-group {
    display: flex;
    gap: 0.75rem;
  }
  .btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59,130,246,0.4);
  }
  .btn-secondary {
    background: rgba(255,255,255,0.1);
    color: #e4e4e7;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .btn-secondary:hover {
    background: rgba(255,255,255,0.15);
  }
  .response-area {
    background: rgba(0,0,0,0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.85rem;
    min-height: 100px;
    overflow-x: auto;
  }
  .response-area .json-key { color: #93c5fd; }
  .response-area .json-string { color: #86efac; }
  .response-area .json-number { color: #fbbf24; }
  .routes-list {
    list-style: none;
  }
  .routes-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .routes-list li:last-child { border-bottom: none; }
  .route-path {
    font-family: 'Fira Code', monospace;
    color: #86efac;
    font-size: 0.85rem;
  }
  .route-method {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .method-get { background: #22c55e; color: #000; }
  .method-post { background: #3b82f6; color: #fff; }
  .method-delete { background: #ef4444; color: #fff; }
  .footer {
    text-align: center;
    padding: 2rem 0 1rem;
    color: #71717a;
    font-size: 0.875rem;
  }
  .footer a {
    color: #3b82f6;
    text-decoration: none;
  }
  .footer span {
    color: #ef4444;
  }
  @media (max-width: 640px) {
    .main-content { grid-template-columns: 1fr; }
    .header h1 { font-size: 1.75rem; }
  }
`;

async function generateReactHelloUI(projectDir) {
  const appJsx = `import { useState } from 'react';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\d+)/g, ': <span class="json-number">$1</span>');
}

function App() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSayHello = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: 'Failed to connect to backend', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setResponse(null);
  };

  const routes = [
    { method: 'GET', path: '/api/hello?name=World', desc: 'Greet someone' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{${JSON.stringify(HELLO_UI_STYLES).replace(/`/g, '\\`')}}</style>
      
      <div className="container">
        <div className="header">
          <h1>{name ? \`Hello, \${name}!\` : 'SpringCraft App'}</h1>
          <p>Your Spring Boot + React application is ready</p>
        </div>

        <div className="main-content">
          <div className="card">
            <h2>Say Hello</h2>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                onKeyDown={(e) => e.key === 'Enter' && handleSayHello()}
              />
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleSayHello} disabled={loading}>
                {loading ? 'Loading...' : 'Say Hello'}
              </button>
              <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>

          <div className="card">
            <h2>Response</h2>
            <div className="response-area">
              {response ? (
                <pre dangerouslySetInnerHTML={{ __html: formatJson(response) }} />
              ) : (
                <span style={{ color: '#71717a' }}>Response will appear here...</span>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Backend Routes</h2>
            <ul className="routes-list">
              {routes.map((route, i) => (
                <li key={i}>
                  <span className="route-path">{route.path}</span>
                  <span className={\`route-method method-\${route.method.toLowerCase()}\`}>{route.method}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Frontend Routes</h2>
            <ul className="routes-list">
              <li><span className="route-path">/</span><span className="method-get" style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', background: '#22c55e', color: '#000' }}>GET</span></li>
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#71717a' }}>
              Note: Add routes using React Router in src/App.jsx
            </p>
          </div>
        </div>

        <div className="footer">
          Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank" rel="noopener">springcraft</a>
        </div>
      </div>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.jsx'), appJsx);
}

async function generateVueHelloUI(projectDir) {
  const appVue = `<template>
  <div class="app-container">
    <div class="container">
      <div class="header">
        <h1>{{ greeting }}</h1>
        <p>Your Spring Boot + Vue application is ready</p>
      </div>

      <div class="main-content">
        <div class="card">
          <h2>Say Hello</h2>
          <div class="form-group">
            <label>Your Name</label>
            <input
              v-model="name"
              type="text"
              placeholder="Enter your name..."
              @keyup.enter="handleSayHello"
            />
          </div>
          <div class="btn-group">
            <button class="btn btn-primary" @click="handleSayHello" :disabled="loading">
              {{ loading ? 'Loading...' : 'Say Hello' }}
            </button>
            <button class="btn btn-secondary" @click="handleClear">Clear</button>
          </div>
        </div>

        <div class="card">
          <h2>Response</h2>
          <div class="response-area">
            <pre v-if="response" v-html="formattedResponse"></pre>
            <span v-else style="color: #71717a">Response will appear here...</span>
          </div>
        </div>

        <div class="card">
          <h2>Backend Routes</h2>
          <ul class="routes-list">
            <li v-for="(route, i) in backendRoutes" :key="i">
              <span class="route-path">{{ route.path }}</span>
              <span :class="['route-method', 'method-' + route.method.toLowerCase()]">{{ route.method }}</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <h2>Frontend Routes</h2>
          <ul class="routes-list">
            <li>
              <span class="route-path">/</span>
              <span class="route-method method-get">GET</span>
            </li>
          </ul>
          <p style="margin-top: 1rem; font-size: 0.8rem; color: #71717a">
            Note: Add routes using Vue Router
          </p>
        </div>
      </div>

      <div class="footer">
        Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const name = ref('');
const response = ref(null);
const loading = ref(false);

const greeting = computed(() => name.value ? \`Hello, \${name.value}!\` : 'SpringCraft App');

const backendRoutes = [
  { method: 'GET', path: '/api/hello?name=World' },
  { method: 'GET', path: '/api/health' },
  { method: 'POST', path: '/api/echo' },
];

const formattedResponse = computed(() => {
  if (!response.value) return '';
  return JSON.stringify(response.value, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
});

const handleSayHello = async () => {
  if (!name.value.trim()) return;
  loading.value = true;
  try {
    const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name.value)}\`);
    response.value = await res.json();
  } catch (err) {
    response.value = { error: 'Failed to connect to backend', details: err.message };
  } finally {
    loading.value = false;
  }
};

const handleClear = () => {
  name.value = '';
  response.value = null;
};
</script>

<style scoped>
${HELLO_UI_STYLES}
</style>
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.vue'), appVue);
}

async function generateSvelteHelloUI(projectDir) {
  const appSvelte = `<script>
  let name = '';
  let response = null;
  let loading = false;

  $: greeting = name ? \`Hello, \${name}!\` : 'SpringCraft App';

  const backendRoutes = [
    { method: 'GET', path: '/api/hello?name=World' },
    { method: 'GET', path: '/api/health' },
    { method: 'POST', path: '/api/echo' },
  ];

  async function handleSayHello() {
    if (!name.trim()) return;
    loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
      response = await res.json();
    } catch (err) {
      response = { error: 'Failed to connect to backend', details: err.message };
    } finally {
      loading = false;
    }
  }

  function handleClear() {
    name = '';
    response = null;
  }

  function formatJson(json) {
    if (!json) return '';
    return JSON.stringify(json, null, 2)
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\\d+)/g, ': <span class="json-number">$1</span>');
  }
</script>

<div class="app-container">
  <div class="container">
    <div class="header">
      <h1>{greeting}</h1>
      <p>Your Spring Boot + Svelte application is ready</p>
    </div>

    <div class="main-content">
      <div class="card">
        <h2>Say Hello</h2>
        <div class="form-group">
          <label for="name-input">Your Name</label>
          <input
            id="name-input"
            type="text"
            bind:value={name}
            placeholder="Enter your name..."
            on:keydown={(e) => e.key === 'Enter' && handleSayHello()}
          />
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" on:click={handleSayHello} disabled={loading}>
            {loading ? 'Loading...' : 'Say Hello'}
          </button>
          <button class="btn btn-secondary" on:click={handleClear}>Clear</button>
        </div>
      </div>

      <div class="card">
        <h2>Response</h2>
        <div class="response-area">
          {#if response}
            <pre>{@html formatJson(response)}</pre>
          {:else}
            <span style="color: #71717a">Response will appear here...</span>
          {/if}
        </div>
      </div>

      <div class="card">
        <h2>Backend Routes</h2>
        <ul class="routes-list">
          {#each backendRoutes as route, i}
            <li>
              <span class="route-path">{route.path}</span>
              <span class="route-method method-{route.method.toLowerCase()}">{route.method}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="card">
        <h2>Frontend Routes</h2>
        <ul class="routes-list">
          <li>
            <span class="route-path">/</span>
            <span class="route-method method-get">GET</span>
          </li>
        </ul>
        <p style="margin-top: 1rem; font-size: 0.8rem; color: #71717a">
          Note: Add routes using SvelteKit or svelte-routing
        </p>
      </div>
    </div>

    <div class="footer">
      Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
    </div>
  </div>
</div>
</script>

<style>
${HELLO_UI_STYLES}
</style>
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.svelte'), appSvelte);
}

async function generateAngularHelloUI(projectDir) {
  const styles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:host {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #e4e4e7;
  display: block;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header { text-align: center; margin-bottom: 2rem; }
.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #6ee7b7, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
.header p { color: #a1a1aa; }
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}
.card h2 {
  font-size: 1rem;
  color: #a1a1aa;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 1rem;
}
.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
}
.btn-group { display: flex; gap: 0.75rem; }
.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-secondary { background: rgba(255,255,255,0.1); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); }
.btn-secondary:hover { background: rgba(255,255,255,0.15); }
.response-area {
  background: rgba(0,0,0,0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  min-height: 100px;
  overflow-x: auto;
}
.response-area .json-key { color: #93c5fd; }
.response-area .json-string { color: #86efac; }
.response-area .json-number { color: #fbbf24; }
.routes-list { list-style: none; }
.routes-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.routes-list li:last-child { border-bottom: none; }
.route-path { font-family: 'Fira Code', monospace; color: #86efac; font-size: 0.85rem; }
.route-method {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.method-get { background: #22c55e; color: #000; }
.method-post { background: #3b82f6; color: #fff; }
.method-delete { background: #ef4444; color: #fff; }
.footer {
  text-align: center;
  padding: 2rem 0 1rem;
  color: #71717a;
  font-size: 0.875rem;
}
.footer a { color: #3b82f6; text-decoration: none; }
.footer span { color: #ef4444; }
@media (max-width: 640px) { .main-content { grid-template-columns: 1fr; } .header h1 { font-size: 1.75rem; } }
`;

  const appComponentTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  name = '';
  response: any = null;
  loading = false;
  formattedResponse = '';

  get greeting(): string {
    return this.name ? \`Hello, \${this.name}!\` : 'SpringCraft App';
  }

  backendRoutes = [
    { method: 'GET', path: '/api/hello?name=World', desc: 'Greet someone' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
  ];

  async handleSayHello() {
    if (!this.name.trim()) return;
    this.loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(this.name)}\`);
      this.response = await res.json();
      this.formattedResponse = JSON.stringify(this.response, null, 2);
    } catch (err: any) {
      this.response = { error: 'Failed to connect to backend', details: err.message };
      this.formattedResponse = JSON.stringify(this.response, null, 2);
    } finally {
      this.loading = false;
    }
  }

  handleClear() {
    this.name = '';
    this.response = null;
    this.formattedResponse = '';
  }
}
`;

  const appComponentHtml = `<div class="container">
  <div class="header">
    <h1>{{ greeting }}</h1>
    <p>Your Spring Boot + Angular application is ready</p>
  </div>

  <div class="main-content">
    <div class="card">
      <h2>Say Hello</h2>
      <div class="form-group">
        <label>Your Name</label>
        <input
          type="text"
          [(ngModel)]="name"
          placeholder="Enter your name..."
          (keyup.enter)="handleSayHello()"
        />
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" (click)="handleSayHello()" [disabled]="loading">
          {{ loading ? 'Loading...' : 'Say Hello' }}
        </button>
        <button class="btn btn-secondary" (click)="handleClear()">Clear</button>
      </div>
    </div>

    <div class="card">
      <h2>Response</h2>
      <div class="response-area">
        <pre *ngIf="formattedResponse">{{ formattedResponse }}</pre>
        <span *ngIf="!formattedResponse" style="color: #71717a">Response will appear here...</span>
      </div>
    </div>

    <div class="card">
      <h2>Backend Routes</h2>
      <ul class="routes-list">
        @for (route of backendRoutes; track route.path) {
          <li>
            <span class="route-path">{{ route.path }}</span>
            <span [class]="'route-method method-' + route.method.toLowerCase()">{{ route.method }}</span>
          </li>
        }
      </ul>
    </div>

    <div class="card">
      <h2>Frontend Routes</h2>
      <ul class="routes-list">
        <li>
          <span class="route-path">/</span>
          <span class="route-method method-get">GET</span>
        </li>
      </ul>
      <p style="margin-top: 1rem; font-size: 0.8rem; color: #71717a">
        Note: Add routes using Angular Router in app.routes.ts
      </p>
    </div>
  </div>

  <div class="footer">
    Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
  </div>
</div>
`;

  const frontendSrc = path.join(projectDir, 'frontend', 'src', 'app');
  await fs.ensureDir(frontendSrc);
  
  await fs.writeFile(path.join(frontendSrc, 'app.component.ts'), appComponentTs);
  await fs.writeFile(path.join(frontendSrc, 'app.component.html'), appComponentHtml);
  await fs.writeFile(path.join(frontendSrc, 'app.component.css'), styles);
}


async function generateLitHelloUI(projectDir) {
  const styles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:host {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #e4e4e7;
  display: block;
}
.container { max-width: 800px; margin: 0 auto; padding: 2rem; min-height: 100vh; display: flex; flex-direction: column; }
.header { text-align: center; margin-bottom: 2rem; }
.header h1 { font-size: 2.5rem; font-weight: 700; background: linear-gradient(90deg, #6ee7b7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
.header p { color: #a1a1aa; }
.main-content { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; }
.card h2 { font-size: 1rem; color: #a1a1aa; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; }
.form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.3); }
.btn-group { display: flex; gap: 0.75rem; }
.btn { flex: 1; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-secondary { background: rgba(255,255,255,0.1); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); }
.btn-secondary:hover { background: rgba(255,255,255,0.15); }
.response-area { background: rgba(0,0,0,0.3); border-radius: 0.5rem; padding: 1rem; font-family: 'Fira Code', monospace; font-size: 0.85rem; min-height: 100px; overflow-x: auto; }
.response-area .json-key { color: #93c5fd; }
.response-area .json-string { color: #86efac; }
.response-area .json-number { color: #fbbf24; }
.routes-list { list-style: none; }
.routes-list li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
.routes-list li:last-child { border-bottom: none; }
.route-path { font-family: 'Fira Code', monospace; color: #86efac; font-size: 0.85rem; }
.route-method { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.method-get { background: #22c55e; color: #000; }
.method-post { background: #3b82f6; color: #fff; }
.footer { text-align: center; padding: 2rem 0 1rem; color: #71717a; font-size: 0.875rem; }
.footer a { color: #3b82f6; text-decoration: none; }
.footer span { color: #ef4444; }
@media (max-width: 640px) { .main-content { grid-template-columns: 1fr; } .header h1 { font-size: 1.75rem; } }
`;

  const myElement = `import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
}

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css\`${styles}\`;

  @state() name = '';
  @state() response = null;
  @state() loading = false;

  get greeting() {
    return this.name ? \`Hello, \${this.name}!\` : 'SpringCraft App';
  }

  backendRoutes = [
    { method: 'GET', path: '/api/hello?name=World', desc: 'Greet someone' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
  ];

  async handleSayHello() {
    if (!this.name.trim()) return;
    this.loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(this.name)}\`);
      this.response = await res.json();
    } catch (err) {
      this.response = { error: 'Failed to connect to backend', details: err.message };
    } finally {
      this.loading = false;
    }
  }

  handleClear() {
    this.name = '';
    this.response = null;
  }

  render() {
    return html\`
      <div class="container">
        <div class="header">
          <h1>\${this.greeting}</h1>
          <p>Your Spring Boot + Lit application is ready</p>
        </div>
        <div class="main-content">
          <div class="card">
            <h2>Say Hello</h2>
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" .value=\${this.name} @input=\${(e) => this.name = e.target.value} @keyup.enter=\${this.handleSayHello} placeholder="Enter your name..." />
            </div>
            <div class="btn-group">
              <button class="btn btn-primary" @click=\${this.handleSayHello} ?disabled=\${this.loading}>
                \${this.loading ? 'Loading...' : 'Say Hello'}
              </button>
              <button class="btn btn-secondary" @click=\${this.handleClear}>Clear</button>
            </div>
          </div>
          <div class="card">
            <h2>Response</h2>
            <div class="response-area">
              \${this.response ? html\`<pre>\${formatJson(this.response)}</pre>\` : html\`<span style="color: #71717a">Response will appear here...</span>\`}
            </div>
          </div>
          <div class="card">
            <h2>Backend Routes</h2>
            <ul class="routes-list">
              \${this.backendRoutes.map((route) => html\`
                <li>
                  <span class="route-path">\${route.path}</span>
                  <span class="route-method method-\${route.method.toLowerCase()}">\${route.method}</span>
                </li>
              \`)}
            </ul>
          </div>
          <div class="card">
            <h2>Frontend Routes</h2>
            <ul class="routes-list">
              <li><span class="route-path">/</span><span class="route-method method-get">GET</span></li>
            </ul>
          </div>
        </div>
        <div class="footer">
          Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
        </div>
      </div>
    \`;
  }
}
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'my-element.ts'), myElement);
  
  
  const mainTs = `import './my-element';
import { html, render } from 'lit';

render(html\`<my-element></my-element>\`, document.body);
`;
  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'main.ts'), mainTs);
}


async function generatePreactHelloUI(projectDir) {
  const appJsx = `import { useState } from 'preact/hooks';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
}

const styles = \`${HELLO_UI_STYLES.replace(/`/g, '\\`')}\`;

export function App() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSayHello = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: 'Failed to connect to backend', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setResponse(null);
  };

  const routes = [
    { method: 'GET', path: '/api/hello?name=World', desc: 'Greet someone' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{\`\${styles}\`}</style>
      <div className="container">
        <div className="header">
          <h1>{name ? \`Hello, \${name}!\` : 'SpringCraft App'}</h1>
          <p>Your Spring Boot + Preact application is ready</p>
        </div>
        <div className="main-content">
          <div className="card">
            <h2>Say Hello</h2>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" value={name} onInput={(e) => setName(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && handleSayHello()} placeholder="Enter your name..." />
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleSayHello} disabled={loading}>
                {loading ? 'Loading...' : 'Say Hello'}
              </button>
              <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>
          <div className="card">
            <h2>Response</h2>
            <div className="response-area">
              {response ? (
                <pre dangerouslySetInnerHTML={{ __html: formatJson(response) }} />
              ) : (
                <span style={{ color: '#71717a' }}>Response will appear here...</span>
              )}
            </div>
          </div>
          <div className="card">
            <h2>Backend Routes</h2>
            <ul className="routes-list">
              {routes.map((route, i) => (
                <li key={i}>
                  <span className="route-path">{route.path}</span>
                  <span className={\`route-method method-\${route.method.toLowerCase()}\`}>{route.method}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>Frontend Routes</h2>
            <ul className="routes-list">
              <li><span className="route-path">/</span><span className="method-get" style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', background: '#22c55e', color: '#000' }}>GET</span></li>
            </ul>
          </div>
        </div>
        <div className="footer">
          Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
        </div>
      </div>
    </div>
  );
}
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'app.jsx'), appJsx);
}


async function generateSolidHelloUI(projectDir) {
  const appJsx = `import { createSignal } from 'solid-js';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
}

const styles = \`${HELLO_UI_STYLES.replace(/`/g, '\\`')}\`;

function App() {
  const [name, setName] = createSignal('');
  const [response, setResponse] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const greeting = () => name() ? \`Hello, \${name()}!\` : 'SpringCraft App';

  const handleSayHello = async () => {
    if (!name().trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name())}\`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: 'Failed to connect to backend', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setResponse(null);
  };

  const routes = [
    { method: 'GET', path: '/api/hello?name=World', desc: 'Greet someone' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
  ];

  return (
    <div style={{ "min-height": "100vh", display: "flex", "flex-direction": "column" }}>
      <style>{styles}</style>
      <div class="container">
        <div class="header">
          <h1>{greeting()}</h1>
          <p>Your Spring Boot + Solid application is ready</p>
        </div>
        <div class="main-content">
          <div class="card">
            <h2>Say Hello</h2>
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" value={name()} onInput={(e) => setName(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && handleSayHello()} placeholder="Enter your name..." />
            </div>
            <div class="btn-group">
              <button class="btn btn-primary" onClick={handleSayHello} disabled={loading()}>
                {loading() ? 'Loading...' : 'Say Hello'}
              </button>
              <button class="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>
          <div class="card">
            <h2>Response</h2>
            <div class="response-area">
              {response() ? (
                <pre innerHTML={formatJson(response())} />
              ) : (
                <span style={{ color: '#71717a' }}>Response will appear here...</span>
              )}
            </div>
          </div>
          <div class="card">
            <h2>Backend Routes</h2>
            <ul class="routes-list">
              {routes.map((route, i) => (
                <li key={i}>
                  <span class="route-path">{route.path}</span>
                  <span class={\`route-method method-\${route.method.toLowerCase()}\`}>{route.method}</span>
                </li>
              ))}
            </ul>
          </div>
          <div class="card">
            <h2>Frontend Routes</h2>
            <ul class="routes-list">
              <li><span class="route-path">/</span><span class="method-get" style={{ padding: '0.25rem 0.5rem', "border-radius": '0.25rem', "font-size": '0.7rem', background: '#22c55e', color: '#000' }}>GET</span></li>
            </ul>
          </div>
        </div>
        <div class="footer">
          Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a>
        </div>
      </div>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.jsx'), appJsx);
}

async function generateHelloUI(projectDir) {
  const pkgPath = path.join(projectDir, 'frontend', 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    p.log.warn('Frontend package.json not found, skipping Hello UI generation.');
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    if (pkg.dependencies?.react || pkg.devDependencies?.react) {
      await generateReactHelloUI(projectDir);
      p.log.success('Generated React Hello UI (replaced default counter)');
    } else if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
      await generateVueHelloUI(projectDir);
      p.log.success('Generated Vue Hello UI (replaced default counter)');
    } else if (pkg.dependencies?.svelte || pkg.devDependencies?.svelte) {
      await generateSvelteHelloUI(projectDir);
      p.log.success('Generated Svelte Hello UI (replaced default counter)');
    } else if (pkg.dependencies?.['@angular/core']) {
      await generateAngularHelloUI(projectDir);
      p.log.success('Generated Angular Hello UI (replaced default content)');
    } else if (pkg.dependencies?.preact || pkg.devDependencies?.preact) {
      await generatePreactHelloUI(projectDir);
      p.log.success('Generated Preact Hello UI (replaced default counter)');
    } else if (pkg.dependencies?.solid-js || pkg.devDependencies?.solid-js) {
      await generateSolidHelloUI(projectDir);
      p.log.success('Generated Solid Hello UI (replaced default counter)');
    } else if (pkg.dependencies?.lit || pkg.devDependencies?.lit) {
      await generateLitHelloUI(projectDir);
      p.log.success('Generated Lit Hello UI (replaced default counter)');
    } else {
      p.log.warn('Unknown frontend stack, skipping Hello UI generation.');
    }
  } catch (e) {
    p.log.warn(`Failed to generate Hello UI: ${e.message}`);
  }
}

async function addDefaultController(projectDir, packageName) {
  const basePackage = packageName || 'com.example';
  const packagePath = basePackage.replace(/\./g, '/');
  const controllerDir = path.join(projectDir, 'src/main/java', packagePath);

  await fs.ensureDir(controllerDir);

  const controllerContent = `package ${basePackage};

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello from Spring Boot!");
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return response;
    }
}
`;

  await fs.writeFile(path.join(controllerDir, 'ApiController.java'), controllerContent);
}

export async function runPostScaffold(projectDir, answers) {
  const frontendResult = await askFrontend(projectDir, answers);
  
  const frontendExists = fs.existsSync(path.join(projectDir, 'frontend'));
  const hasFrontend = frontendExists || answers.arch === 'fullstack';

  if (hasFrontend) {
    await addDefaultController(projectDir, answers.packageName);
    p.log.success('Added default API controller at /api/hello');
  }

  await generateDockerCompose(projectDir, answers);
  await generateEnvFiles(projectDir, answers);
  await generateReadme(projectDir, answers);
  await initGit(projectDir, answers);
  await openInEditor(projectDir);

  const isGradle = answers.buildTool?.includes('gradle');
  const springcraftConfig = {
    name: answers.artifactId,
    arch: hasFrontend ? 'fullstack' : 'backend-only',
    buildTool: answers.buildTool,
    language: answers.language,
    javaVersion: answers.javaVersion,
    springBootVersion: answers.springBootVersion,
    packageName: answers.packageName,
    hasFrontend: hasFrontend,
    frontendDir: hasFrontend ? 'frontend' : null,
    frontendStack: frontendResult.stack || (frontendExists ? 'Vite' : null),
    backendPort: 8080,
    frontendPort: 5173,
    runCommand: isGradle ? './gradlew bootRun' : './mvnw spring-boot:run',
    buildCommand: isGradle ? './gradlew build' : './mvnw clean package',
  };

  await fs.writeJson(path.join(projectDir, 'springcraft.json'), springcraftConfig, { spaces: 2 });
  p.log.success('springcraft.json written.');
}
