import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { detectFrontendStack } from '../../../shared/index.js';
import { generateUnifiedHelloUI } from './unified.js';

export async function generateHelloUI(projectDir) {
  const pkgPath = path.join(projectDir, 'frontend', 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    p.log.warn('Frontend package.json not found, skipping Hello UI generation.');
    return false;
  }

  const stack = detectFrontendStack(projectDir) || 'Unknown';
  
  try {
    const html = generateUnifiedHelloUI(projectDir, stack);
    const indexPath = path.join(projectDir, 'frontend', 'index.html');
    await fs.writeFile(indexPath, html);
    p.log.success(`Generated SpringCraft terminal UI`);
    return true;
  } catch (e) {
    p.log.warn(`Failed to generate Hello UI: ${e.message}`);
    return false;
  }
}

export function getAvailableTemplates() {
  return ['react', 'vue', 'svelte', 'angular', 'preact', 'solid', 'lit'];
}
