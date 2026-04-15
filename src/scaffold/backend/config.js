import fs from 'fs-extra';
import path from 'path';
import { CONFIG, getRunCommand, getBuildCommand } from '../../shared/index.js';

export async function writeProjectConfig(projectDir, answers, frontendResult) {
  const frontendExists = fs.existsSync(path.join(projectDir, 'frontend'));
  const hasFrontend = frontendExists || answers.arch === 'fullstack';
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
    frontendStack: frontendResult?.stack || (frontendExists ? detectStack(projectDir) : null),
    backendPort: CONFIG.BACKEND_PORT,
    frontendPort: CONFIG.FRONTEND_PORT,
    runCommand: getRunCommand(answers.buildTool),
    buildCommand: getBuildCommand(answers.buildTool),
  };

  await fs.writeJson(path.join(projectDir, CONFIG.SPRINGCRAFT_JSON), springcraftConfig, { spaces: 2 });
}

function detectStack(projectDir) {
  const pkgPath = path.join(projectDir, 'frontend', 'package.json');
  if (!fs.existsSync(pkgPath)) return 'Vite';
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.dependencies?.react) return 'React';
    if (pkg.dependencies?.vue) return 'Vue';
    if (pkg.dependencies?.svelte) return 'Svelte';
    if (pkg.dependencies?.['@angular/core']) return 'Angular';
    if (pkg.dependencies?.preact) return 'Preact';
    if (pkg.dependencies?.['solid-js']) return 'Solid';
    if (pkg.dependencies?.lit) return 'Lit';
  } catch (e) {}
  
  return 'Vite';
}
