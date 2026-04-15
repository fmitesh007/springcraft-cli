import * as p from '@clack/prompts';
import { execSync, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../shared/index.js';

export function loadProjectConfig() {
  const configPath = path.join(process.cwd(), CONFIG.SPRINGCRAFT_JSON);

  if (!fs.existsSync(configPath)) {
    p.log.error(`Not a springcraft project. Run: springcraft <path> to scaffold first.`);
    process.exit(1);
  }

  try {
    return fs.readJsonSync(configPath);
  } catch (e) {
    p.log.error(`Failed to read ${CONFIG.SPRINGCRAFT_JSON}: ${e.message}`);
    process.exit(1);
  }
}

export { getRunCommand, getBuildCommand } from '../shared/index.js';

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
