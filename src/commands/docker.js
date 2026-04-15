import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const DOCKER_ACTIONS = { up: 'docker-compose up -d', down: 'docker-compose down', logs: 'docker-compose logs -f' };

export function handleDocker(flags, args) {
  const action = flags.dockerAction;

  if (!action) {
    p.log.error('Usage: springcraft --docker [up|down|logs]');
    process.exit(1);
  }

  if (!DOCKER_ACTIONS[action]) {
    p.log.error(`Invalid action: ${action}. Use: springcraft --docker [up|down|logs]`);
    process.exit(1);
  }

  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');

  if (!fs.existsSync(dockerComposePath)) {
    p.log.warn('No docker-compose.yml found. Was it generated during scaffold?');
    process.exit(1);
  }

  p.log.step(`Running: ${DOCKER_ACTIONS[action]}`);

  try {
    execSync(DOCKER_ACTIONS[action], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });
  } catch (e) {
    p.log.error('Docker command failed. Is Docker running?');
    process.exit(1);
  }
}
