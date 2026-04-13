#!/usr/bin/env node

import { run } from '../src/generator.js';

const projectName = process.argv[2];
const VALID_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9-_]*$/;

if (!projectName || !VALID_NAME_PATTERN.test(projectName)) {
  console.error('Usage: create-spring-app <project-name>');
  console.error('Project name must start with a letter and contain only letters, numbers, hyphens, and underscores.');
  process.exit(1);
}

try {
  await run(projectName);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
