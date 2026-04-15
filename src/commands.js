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
  const frontendDir = config.frontendDir || 'frontend';
  const hasFrontendDir = fs.existsSync(path.join(process.cwd(), frontendDir));

  if (flags.dev) {
    if (!hasFrontendDir) {
      p.log.error('No frontend found. Check if frontend/ folder exists.');
      process.exit(1);
    }

    console.log('\n  Starting backend and frontend concurrently...\n');

    const backend = spawn(config.runCommand, [], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    });

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), frontendDir),
      shell: true,
      stdio: 'inherit'
    });

    const cleanup = () => {
      console.log('\n\n  Shutting down...\n');
      if (backend.pid) process.kill(-backend.pid, 'SIGTERM');
      if (frontend.pid) process.kill(-frontend.pid, 'SIGTERM');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);

    backend.on('close', (code) => {
      if (code !== 0) console.error(`Backend exited with code ${code}`);
    });

    frontend.on('close', (code) => {
      if (code !== 0) console.error(`Frontend exited with code ${code}`);
    });

  } else if (flags.frontend) {
    const frontendDir = config.frontendDir || 'frontend';
    if (!hasFrontendDir) {
      p.log.error('No frontend found. Check if frontend/ folder exists.');
      process.exit(1);
    }

    try {
      execSync('npm run dev', {
        cwd: path.join(process.cwd(), frontendDir),
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
  const frontendDir = config.frontendDir || 'frontend';
  const hasFrontendDir = fs.existsSync(path.join(process.cwd(), frontendDir));

  if (flags.prod) {
    const spinner = p.spinner();

    if (hasFrontendDir) {
      spinner.start('Building frontend...');
      try {
        execSync('npm run build', {
          cwd: path.join(process.cwd(), frontendDir),
          stdio: 'pipe',
          shell: true
        });
        spinner.stop('Frontend built.');

        spinner.start('Copying to src/main/resources/static/...');
        const staticDir = path.join(process.cwd(), 'src/main/resources/static');
        await fs.empty(staticDir);
        await fs.copy(
          path.join(process.cwd(), frontendDir, 'dist'),
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
  const backendPort = config.backendPort || 8080;
  const frontendPort = config.frontendPort || 5173;

  const arch = config.arch === 'fullstack' ? 'fullstack (Monolithic)' : 'backend-only';
  const buildToolName = config.buildTool === 'maven-project' ? 'Maven' : config.buildTool === 'gradle-project-kotlin' ? 'Gradle Kotlin DSL' : 'Gradle';
  const langName = config.language === 'java' ? 'Java' : config.language === 'kotlin' ? 'Kotlin' : 'Groovy';
  const frontendDisplay = config.hasFrontend && config.frontendStack 
    ? `${config.frontendStack} (${config.frontendDir || 'frontend'})`
    : (config.hasFrontend ? (config.frontendDir || 'frontend') : 'none');

  const lines = [
    '',
    '╭─ Project Info ────────────────────────────────╮',
    `│ Name:         ${(config.name || 'unknown').padEnd(35)}│`,
    `│ Architecture: ${arch.padEnd(35)}│`,
    `│ Build Tool:   ${buildToolName.padEnd(35)}│`,
    `│ Language:     ${langName.padEnd(35)}│`,
    `│ Java Version: ${(config.javaVersion || '17').padEnd(35)}│`,
    `│ Spring Boot:  ${(config.springBootVersion || '3.5.0').padEnd(35)}│`,
    `│ Frontend:     ${frontendDisplay.padEnd(35)}│`,
    '├─────────────────────────────────────────────────┤',
    `│  Backend:  http://localhost:${String(backendPort).padEnd(24)}│`,
    config.hasFrontend ? `│  Frontend: http://localhost:${String(frontendPort).padEnd(23)}│` : '',
    '├─────────────────────────────────────────────────┤',
    `│ Run:       ${runCmd.substring(0, 35).padEnd(35)}│`,
    `│ Build:     ${buildCmd.substring(0, 35).padEnd(35)}│`,
    '╰─────────────────────────────────────────────────╯',
    ''
  ].filter(line => line !== '');

  console.log(lines.join('\n'));
}
