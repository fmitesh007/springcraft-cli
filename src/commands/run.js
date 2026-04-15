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

function cleanupProcesses(backend, frontend) {
  const cleanup = () => {
    console.log('\n\n  Shutting down...\n');
    if (frontend && frontend.pid) {
      try {
        process.kill(frontend.pid, 'SIGTERM');
      } catch (e) {}
    }
    if (backend && backend.pid) {
      try {
        process.kill(backend.pid, 'SIGTERM');
      } catch (e) {}
    }
    setTimeout(() => {
      if (frontend && frontend.pid) {
        try { process.kill(frontend.pid, 'SIGKILL'); } catch (e) {}
      }
      if (backend && backend.pid) {
        try { process.kill(backend.pid, 'SIGKILL'); } catch (e) {}
      }
      process.exit(0);
    }, 1000);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
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
      stdio: 'inherit',
      detached: false
    });

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), frontendDir),
      shell: true,
      stdio: 'inherit',
      detached: false
    });

    cleanupProcesses(backend, frontend);

    let hasError = false;

    backend.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Backend exited with code ${code}`);
        hasError = true;
      }
      if (!hasError && code !== null) {
        console.log('  Backend stopped.');
      }
    });

    frontend.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Frontend exited with code ${code}`);
        hasError = true;
      }
    });

    backend.on('error', (err) => {
      console.error(`Backend error: ${err.message}`);
      hasError = true;
    });

    frontend.on('error', (err) => {
      console.error(`Frontend error: ${err.message}`);
      hasError = true;
    });

  } else if (flags.frontend) {
    if (!hasFrontendDir) {
      p.log.error('No frontend found. Check if frontend/ folder exists.');
      process.exit(1);
    }

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), frontendDir),
      shell: true,
      stdio: 'inherit'
    });

    cleanupProcesses(frontend, null);

    frontend.on('close', (code) => {
      process.exit(code || 0);
    });

  } else {
    const backend = spawn(config.runCommand, [], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    });

    cleanupProcesses(backend, null);

    backend.on('close', (code) => {
      process.exit(code || 0);
    });
  }
}
