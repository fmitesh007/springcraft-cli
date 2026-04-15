import * as p from '@clack/prompts';
import path from 'path';
import fs from 'fs-extra';
import { CONFIG } from '../shared/index.js';
import { scaffoldFrontend } from './frontend/index.js';
import { addDefaultController } from './backend/controller.js';
import { writeProjectConfig } from './backend/config.js';
import { generateDockerCompose } from './docker.js';
import { generateEnvFiles } from './env.js';
import { generateReadme } from './readme.js';
import { initGit } from './git.js';

export async function runPostScaffold(projectDir, answers) {
  let frontendResult = { scaffolded: false, stack: null };

  if (answers.arch === 'fullstack') {
    if (answers.frontend && answers.frontend !== 'none') {
      frontendResult = await scaffoldFrontend(projectDir, answers.frontend, answers.frontend);
    } else {
      const choice = await askFrontendFramework();
      if (choice && choice !== 'none') {
        frontendResult = await scaffoldFrontend(projectDir, choice, null);
      }
    }
  }

  if (answers.arch === 'fullstack' || fs.existsSync(path.join(projectDir, 'frontend'))) {
    await addDefaultController(projectDir, answers.packageName);
    p.log.success('Added default API controller at /api/hello');
  }

  await generateDockerCompose(projectDir, answers);
  await generateEnvFiles(projectDir, answers);
  await generateReadme(projectDir, answers);
  await initGit(projectDir, answers);
  await writeProjectConfig(projectDir, answers, frontendResult);
}

async function askFrontendFramework() {
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
    return 'angular';
  }

  return choice;
}
