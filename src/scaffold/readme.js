import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG, getRunCommand, getBuildCommand } from '../shared/index.js';

const DEP_CATEGORIES = {
  web: ['web', 'webflux', 'graphql', 'websocket', 'jersey', 'hateoas'],
  data: ['data-jpa', 'jdbc', 'data-jdbc', 'mybatis', 'flyway', 'liquibase'],
  db: ['h2', 'postgresql', 'mysql', 'mariadb', 'mssql', 'data-mongodb', 'data-redis', 'data-elasticsearch'],
  security: ['security', 'oauth2-client', 'oauth2-resource-server'],
  devtools: ['devtools', 'lombok', 'docker-compose', 'spring-shell', 'configuration-processor'],
  ops: ['actuator', 'prometheus', 'distributed-tracing'],
  io: ['batch', 'mail', 'quartz', 'cache', 'validation'],
};

const CAT_NAMES = {
  web: 'Web', data: 'Data Access', db: 'Databases', security: 'Security',
  devtools: 'Developer Tools', ops: 'Operations', io: 'I/O',
};

export async function generateReadme(projectDir, answers) {
  const deps = answers.dependencies || [];
  const runCmd = getRunCommand(answers.buildTool);
  const buildCmd = getBuildCommand(answers.buildTool);
  const buildTool = answers.buildTool?.includes('kotlin') ? 'Gradle Kotlin DSL' : 
                    answers.buildTool?.includes('gradle') ? 'Gradle Groovy DSL' : 'Maven';

  const hasDocker = deps.some(d => CONFIG.DB_DEPS.includes(d));
  const hasFrontend = fs.existsSync(path.join(projectDir, 'frontend'));
  const hasEnvVars = deps.some(d => ['postgresql', 'mysql', 'mariadb', 'data-redis', 'security', 'mail', 'kafka', 'amqp'].includes(d));

  let depsByCategory = {};
  for (const [cat, catDeps] of Object.entries(DEP_CATEGORIES)) {
    const matched = deps.filter(d => catDeps.includes(d));
    if (matched.length > 0) depsByCategory[CAT_NAMES[cat]] = matched;
  }

  let depsSection = '';
  if (Object.keys(depsByCategory).length > 0) {
    depsSection = '\n## Dependencies\n\n' + Object.entries(depsByCategory)
      .map(([cat, catDeps]) => `| **${cat}** | ${catDeps.join(', ')} |`)
      .join('\n') + '\n';
  }

  let dockerSection = hasDocker ? '\n## Local Services\n\n```bash\ndocker-compose up -d\n```\n' : '';
  let envSection = hasEnvVars ? '\n## Environment Variables\n\nCopy `.env.example` to `.env` and configure.\n' : '';
  let frontendSection = '';

  if (hasFrontend) {
    let frontendType = 'Frontend';
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'frontend', 'package.json'), 'utf-8'));
      if (pkg.dependencies?.react) frontendType = 'React';
      else if (pkg.dependencies?.vue) frontendType = 'Vue';
      else if (pkg.dependencies?.svelte) frontendType = 'Svelte';
      else if (pkg.dependencies?.['@angular/core']) frontendType = 'Angular';
    } catch {}
    frontendSection = `\n## Frontend\n\n\`\`\`bash\ncd frontend\nnpm install\nnpm run dev\n\`\`\`\n`;
  }

  const content = `# ${answers.artifactId}

> ${answers.description || 'A Spring Boot application'}

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Spring Boot ${answers.springBootVersion || '3.5.0'} |
| Language | ${answers.language?.charAt(0).toUpperCase() + answers.language?.slice(1)} |
| Java Version | ${answers.javaVersion || '17'} |
| Build Tool | ${buildTool} |
${depsSection}
## Getting Started

\`\`\`bash
# Build
${buildCmd}

# Run
${runCmd}
\`\`\`
${hasFrontend ? '\n## API Endpoints\n\n| Endpoint | Method | Description |\n|---|---|---|\n| `/api/hello` | GET | Greet someone |\n| `/api/health` | GET | Health check |\n' : ''}${dockerSection}${envSection}${frontendSection}
## Project Structure

\`\`\`
.
├── src/main/java     # Source code
├── src/main/resources # Config
├── src/test         # Tests${hasFrontend ? '\n├── frontend/       # Frontend' : ''}
${hasDocker ? '├── docker-compose.yml\n' : ''}└── pom.xml${answers.buildTool?.includes('gradle') ? ' or build.gradle' : ''}
\`\`\`

---
Built with ❤ using [springcraft](https://github.com/fmitesh/springcraft)
`;

  await fs.outputFile(path.join(projectDir, 'README.md'), content);
  p.log.success('README.md generated.');
}
