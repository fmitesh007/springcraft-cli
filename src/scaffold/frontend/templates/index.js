import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { detectFrontendStack } from '../../../shared/index.js';
import { generateReactHelloUI } from './react.js';
import { generateVueHelloUI } from './vue.js';
import { generateSvelteHelloUI } from './svelte.js';
import { generateAngularHelloUI } from './angular.js';
import { generatePreactHelloUI } from './preact.js';
import { generateSolidHelloUI } from './solid.js';
import { generateLitHelloUI } from './lit.js';

const generators = {
  react: generateReactHelloUI,
  vue: generateVueHelloUI,
  svelte: generateSvelteHelloUI,
  angular: generateAngularHelloUI,
  preact: generatePreactHelloUI,
  solid: generateSolidHelloUI,
  lit: generateLitHelloUI,
};

export async function generateHelloUI(projectDir) {
  const pkgPath = path.join(projectDir, 'frontend', 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    p.log.warn('Frontend package.json not found, skipping Hello UI generation.');
    return;
  }

  const stack = detectFrontendStack(projectDir);
  
  if (!stack) {
    p.log.warn('Unknown frontend stack, skipping Hello UI generation.');
    return;
  }

  const generatorKey = stack.toLowerCase();
  const generator = generators[generatorKey];
  
  if (!generator) {
    p.log.warn(`Hello UI not available for ${stack}, skipping.`);
    return;
  }

  try {
    await generator(projectDir);
    p.log.success(`Generated ${stack} Hello UI (replaced default template)`);
  } catch (e) {
    p.log.warn(`Failed to generate Hello UI: ${e.message}`);
  }
}
