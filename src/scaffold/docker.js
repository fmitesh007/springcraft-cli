import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG, yamlStringify } from '../shared/index.js';

export async function generateDockerCompose(projectDir, answers) {
  const deps = answers.dependencies || [];
  const matchingDbs = deps.filter(d => CONFIG.DB_DEPS.includes(d));

  if (matchingDbs.length === 0) return;

  const confirm = await p.confirm({
    message: 'Generate docker-compose.yml for local dev?',
    initialValue: true,
  });

  if (!confirm) return;

  const services = {};

  for (const db of matchingDbs) {
    const port = CONFIG.DB_PORTS[db];
    const image = CONFIG.DB_IMAGES[db];
    const svcName = db.replace('data-', '');
    services[svcName] = { image, ports: [`${port}:${port}`] };

    if (db === 'postgresql') {
      services[svcName].environment = ['POSTGRES_DB=dbname', 'POSTGRES_USER=postgres', 'POSTGRES_PASSWORD=secret'];
      services[svcName].volumes = ['postgres_data:/var/lib/postgresql/data'];
    } else if (db === 'mysql') {
      services[svcName].environment = ['MYSQL_DATABASE=dbname', 'MYSQL_USER=user', 'MYSQL_PASSWORD=secret'];
    } else if (db === 'data-elasticsearch') {
      services[svcName].environment = ['discovery.type=single-node', 'xpack.security.enabled=false'];
      services[svcName].volumes = ['es_data:/usr/share/elasticsearch/data'];
    } else if (db === 'data-mongodb') {
      services[svcName].volumes = ['mongo_data:/data/db'];
    }
  }

  const volumes = {};
  if (matchingDbs.includes('postgresql')) volumes['postgres_data'] = null;
  if (matchingDbs.includes('data-elasticsearch')) volumes['es_data'] = null;
  if (matchingDbs.includes('data-mongodb')) volumes['mongo_data'] = null;

  if (Object.keys(volumes).length > 0) services.volumes = volumes;

  const dockerCompose = { version: '3.8', services };
  await fs.outputFile(path.join(projectDir, 'docker-compose.yml'), yamlStringify(dockerCompose));
  p.log.success('docker-compose.yml generated.');
}
