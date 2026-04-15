import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { detectFrontendStack } from '../../shared/index.js';
import { generateHelloUI } from './templates/index.js';
import { configureViteProxy } from './proxy.js';

async function tryScaffoldVite(projectDir, choice, env) {
  const commands = [
    `npx create-vite@latest frontend --template ${choice} --skip-install`,
    `npm create vite@latest frontend -- --template ${choice}`,
  ];
  
  for (const cmd of commands) {
    try {
      execSync(cmd, { cwd: projectDir, stdio: 'inherit', env });
      return true;
    } catch (e) {
      continue;
    }
  }
  return false;
}

export async function scaffoldFrontend(projectDir, framework, cliFlag) {
  if (framework === 'none') {
    p.log.info('Skipping frontend (none selected).');
    return { scaffolded: false, stack: null };
  }

  const choice = cliFlag || framework;
  const env = { 
    ...process.env, 
    CI: 'true',
    NPM_CONFIG_YES: 'true',
    npm_config_yes: 'true'
  };

  try {
    p.log.step(`Running: npx create-vite@latest frontend --template ${choice}`);
    
    const success = await tryScaffoldVite(projectDir, choice, env);
    
    if (!success) {
      p.log.warn('Frontend scaffolding failed. Install manually if needed.');
      return { scaffolded: false, stack: null };
    }
    
    const stackName = choice.charAt(0).toUpperCase() + choice.slice(1);
    p.log.success(`${stackName} frontend scaffolded.`);

    if (!fs.existsSync(path.join(projectDir, 'frontend', 'package.json'))) {
      p.log.warn('Frontend package.json not found. Skipping install.');
      return { scaffolded: false, stack: null };
    }

    p.log.step('Installing frontend dependencies...');
    execSync('npm install', {
      cwd: path.join(projectDir, 'frontend'),
      stdio: 'inherit'
    });
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

export async function askFrontendFramework(projectDir) {
  const choice = await p.select({
    message: 'Add a frontend?',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'angular', label: 'Angular' },
      { value: 'none', label: 'None' },
    ],
  });

  if (p.isCancel(choice) || choice === 'none') {
    return null;
  }

  if (choice === 'angular') {
    try {
      p.log.step('Running: npx @angular/cli new frontend');
      execSync('npx @angular/cli new frontend --skip-git --skip-tests --style css --ssr=false', {
        cwd: projectDir,
        stdio: 'inherit'
      });
      p.log.success('Angular frontend scaffolded.');
      return 'angular';
    } catch (e) {
      p.log.warn('Angular scaffolding failed. Install manually if needed.');
      return null;
    }
  }

  return choice;
}
