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
  const choice = await p.select({
    message: 'Add a frontend?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'react-js', label: 'React (JavaScript)' },
      { value: 'react-ts', label: 'React (TypeScript)' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
    ],
  });

  if (p.isCancel(choice) || choice === 'none') return;

  const commands = {
    'react-js': 'npm create vite@latest frontend -- --template react',
    'react-ts': 'npm create vite@latest frontend -- --template react-ts',
    'vue': 'npm create vite@latest frontend -- --template vue',
    'angular': 'ng new frontend --directory frontend',
  };

  const cmd = commands[choice];
  if (cmd) {
    try {
      p.log.step(`Running: ${cmd}`);
      execSync(cmd, { cwd: projectDir, stdio: 'inherit' });
      p.log.success('Frontend scaffolded.');
    } catch (e) {
      p.log.warn('Frontend scaffolding failed. Install manually if needed.');
    }
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
    exampleLines.push('SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS=');
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

  let depsList = '';
  const deps = answers.dependencies || [];
  if (deps.length > 0) {
    depsList = '\n## Dependencies\n' + deps.map(d => `- ${d}`).join('\n');
  }

  const hasDocker = answers.dependencies?.some(d => DB_DEPS.includes(d));
  const dockerSection = hasDocker ? '\n## Local Services\n```bash\ndocker-compose up -d\n```' : '';
  const envSection = (answers.dependencies?.some(d => ['postgresql', 'mysql', 'mariadb', 'data-jpa', 'jdbc', 'data-redis', 'security', 'mail', 'kafka', 'amqp'].includes(d))) ? '\n## Environment Variables\nCopy `.env.example` to `.env` and fill in your values.' : '';
  const frontendSection = fs.existsSync(path.join(projectDir, 'frontend')) ? '\n## Frontend\n```bash\ncd frontend && npm install && npm run dev\n```' : '';

  const content = `# ${answers.artifactId || 'spring-boot-app'}
> ${answers.description || 'Demo project for Spring Boot'}

## Tech Stack
| | |
|---|---|
| Build Tool | ${answers.buildTool?.includes('maven') ? 'Maven' : 'Gradle'} |
| Language | ${answers.language || 'Java'} |
| Java Version | ${answers.javaVersion || '17'} |
| Spring Boot | ${answers.springBootVersion || '3.5.0' }
${depsList}
## Prerequisites
- Java ${answers.javaVersion || '17'}
- ${answers.buildTool?.includes('maven') ? 'Maven' : 'Gradle'}
## Getting Started
\`\`\`bash
cd ${answers.artifactId}
${runCommand}
\`\`\`${dockerSection}${envSection}${frontendSection}
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
    execSync('git commit -m "Initial commit via create-spring-app"', { cwd: projectDir, stdio: 'pipe' });
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

export async function runPostScaffold(projectDir, answers) {
  await askFrontend(projectDir, answers);
  await generateDockerCompose(projectDir, answers);
  await generateEnvFiles(projectDir, answers);
  await generateReadme(projectDir, answers);
  await initGit(projectDir, answers);
  await openInEditor(projectDir);
}
