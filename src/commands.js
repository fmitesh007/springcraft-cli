import * as p from '@clack/prompts';
import { execSync, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const SPRINGCRAFT_JSON = 'springcraft.json';

export function loadProjectConfig() {
  const configPath = path.join(process.cwd(), SPRINGCRAFT_JSON);

  if (!fs.existsSync(configPath)) {
    p.log.error(`Not a springcraft project. Run: springcraft <path> to scaffold first.`);
    process.exit(1);
  }

  try {
    return fs.readJsonSync(configPath);
  } catch (e) {
    p.log.error(`Failed to read ${SPRINGCRAFT_JSON}: ${e.message}`);
    process.exit(1);
  }
}

export function handleRun(flags) {
  const config = loadProjectConfig();

  if (flags.dev) {
    if (!config.hasFrontend) {
      p.log.error('No frontend found in this project. Scaffold with frontend first.');
      process.exit(1);
    }

    const backend = spawn(config.runCommand, [], {
      cwd: process.cwd(),
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), config.frontendDir),
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const reset = '\x1b[0m';
    const cyan = '\x1b[36m';
    const magenta = '\x1b[35m';

    backend.stdout.on('data', (data) => {
      process.stdout.write(`${cyan}[backend]${reset} ${data}`);
    });
    backend.stderr.on('data', (data) => {
      process.stderr.write(`${cyan}[backend]${reset} ${data}`);
    });

    frontend.stdout.on('data', (data) => {
      process.stdout.write(`${magenta}[frontend]${reset} ${data}`);
    });
    frontend.stderr.on('data', (data) => {
      process.stderr.write(`${magenta}[frontend]${reset} ${data}`);
    });

    const cleanup = () => {
      p.log.step('Shutting down...');
      if (backend.pid) process.kill(-backend.pid, 'SIGTERM');
      if (frontend.pid) process.kill(-frontend.pid, 'SIGTERM');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);

    backend.on('close', (code) => {
      if (code !== 0) process.stderr.write(`Backend exited with code ${code}\n`);
    });

    frontend.on('close', (code) => {
      if (code !== 0) process.stderr.write(`Frontend exited with code ${code}\n`);
    });

  } else if (flags.frontend) {
    if (!config.hasFrontend) {
      p.log.error('No frontend found in this project.');
      process.exit(1);
    }

    try {
      execSync('npm run dev', {
        cwd: path.join(process.cwd(), config.frontendDir),
        stdio: 'inherit',
        shell: true
      });
    } catch (e) {
      p.log.error('Frontend build failed.');
      process.exit(1);
    }

  } else {
    try {
      execSync(config.runCommand, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
      });
    } catch (e) {
      process.exit(1);
    }
  }
}

export async function handleBuild(flags) {
  const config = loadProjectConfig();

  if (flags.prod) {
    const spinner = p.spinner();

    if (config.hasFrontend) {
      spinner.start('Building frontend...');
      try {
        execSync('npm run build', {
          cwd: path.join(process.cwd(), config.frontendDir),
          stdio: 'pipe',
          shell: true
        });
        spinner.stop('Frontend built.');

        spinner.start('Copying to src/main/resources/static/...');
        const staticDir = path.join(process.cwd(), 'src/main/resources/static');
        await fs.empty(staticDir);
        await fs.copy(
          path.join(process.cwd(), config.frontendDir, 'dist'),
          staticDir
        );
        spinner.stop('Copied to static resources.');
      } catch (e) {
        spinner.stop('');
        p.log.error('Frontend build failed.');
        process.exit(1);
      }
    }

    spinner.start('Building jar...');
    try {
      execSync(config.buildCommand, {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true
      });
      spinner.stop('Build complete.');
      p.log.success('Production build ready.');
    } catch (e) {
      spinner.stop('');
      p.log.error('Backend build failed.');
      process.exit(1);
    }

  } else {
    try {
      execSync(config.buildCommand, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
      });
    } catch (e) {
      process.exit(1);
    }
  }
}

export function handleDocker(flags, args) {
  const config = loadProjectConfig();
  const action = flags.dockerAction;

  if (!action) {
    p.log.error('Usage: springcraft --docker [up|down|logs]');
    process.exit(1);
  }

  if (!['up', 'down', 'logs'].includes(action)) {
    p.log.error(`Invalid action: ${action}. Use: springcraft --docker [up|down|logs]`);
    process.exit(1);
  }

  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');

  if (!fs.existsSync(dockerComposePath)) {
    p.log.warn('No docker-compose.yml found. Was it generated during scaffold?');
    process.exit(1);
  }

  const cmds = {
    up: 'docker-compose up -d',
    down: 'docker-compose down',
    logs: 'docker-compose logs -f'
  };

  p.log.step(`Running: ${cmds[action]}`);

  try {
    execSync(cmds[action], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });
  } catch (e) {
    p.log.error(`Docker command failed. Is Docker running?`);
    process.exit(1);
  }
}

export function handleInfo() {
  const config = loadProjectConfig();

  const runCmd = config.runCommand || (config.buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run');
  const buildCmd = config.buildCommand || (config.buildTool?.includes('gradle') ? './gradlew build' : './mvnw clean package');

  const lines = [
    '',
    '╭─ Project Info ─────────────────────────╮',
    `│ Name:         ${(config.name || 'unknown').padEnd(28)}│`,
    `│ Architecture: ${((config.arch === 'fullstack' ? 'fullstack' : 'backend-only') || 'backend-only').padEnd(28)}│`,
    `│ Build Tool:   ${(config.buildTool === 'maven-project' ? 'Maven' : config.buildTool === 'gradle-project-kotlin' ? 'Gradle Kotlin DSL' : 'Gradle').padEnd(28)}│`,
    `│ Language:     ${((config.language === 'java' ? 'Java' : config.language === 'kotlin' ? 'Kotlin' : 'Groovy') || 'Java').padEnd(28)}│`,
    `│ Java Version: ${((config.javaVersion || '17') + '').padEnd(28)}│`,
    `│ Spring Boot:  ${((config.springBootVersion || '3.5.0') + '').padEnd(28)}│`,
    config.hasFrontend
      ? `│ Frontend:     ${((config.frontendDir || 'frontend') + '').padEnd(28)}│`
      : `│ Frontend:     ${'none'.padEnd(28)}│`,
    `│ Run:          ${runCmd.substring(0, 28).padEnd(28)}│`,
    `│ Build:        ${buildCmd.substring(0, 28).padEnd(28)}│`,
    '╰────────────────────────────────────────╯',
    ''
  ];

  console.log(lines.join('\n'));
}
