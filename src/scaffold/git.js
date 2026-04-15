import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function initGit(projectDir, answers) {
  const confirm = await p.confirm({
    message: 'Initialize git repository?',
    initialValue: true,
  });

  if (!confirm) return;

  try {
    execSync('git init', { cwd: projectDir, stdio: 'pipe' });

    const gitignorePath = path.join(projectDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      await fs.outputFile(gitignorePath, `target/
.gradle/
build/
.env
*.class
.idea/
*.iml
node_modules/
frontend/dist/
*.log
.DS_Store
`);
    }

    execSync('git add .', { cwd: projectDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit via springcraft"', { cwd: projectDir, stdio: 'pipe' });
    p.log.success('Git repository initialized.');
  } catch (e) {
    p.log.warn('Git initialization failed. Initialize manually if needed.');
  }
}
