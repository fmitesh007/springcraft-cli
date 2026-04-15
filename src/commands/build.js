import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { loadProjectConfig } from './run.js';

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
