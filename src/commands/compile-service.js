import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function handleCompileService(serviceName) {
  p.intro('Compile Service');
  
  const cwd = process.cwd();
  const pomPath = path.join(cwd, 'pom.xml');
  
  if (!fs.existsSync(pomPath)) {
    p.log.error('Not in a Spring Boot project directory (pom.xml not found).');
    process.exit(1);
  }
  
  let targetService = serviceName;
  
  if (!targetService) {
    const services = findServices(cwd);
    
    if (services.length === 0) {
      p.log.error('No services found in the project.');
      process.exit(1);
    }
    
    if (services.length === 1) {
      targetService = services[0];
    } else {
      const selected = await p.select({
        message: 'Select service to compile:',
        options: services.map(s => ({ value: s, label: s })),
      });
      
      if (p.isCancel(selected)) {
        p.cancel('Cancelled.');
        process.exit(0);
      }
      
      targetService = selected;
    }
  }
  
  const spinner = p.spinner();
  spinner.start(`Compiling ${targetService}...`);
  
  try {
    execSync('./mvnw compile', {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });
    spinner.stop(`Service ${targetService} compiled successfully!`);
    p.log.success(`Run \`springcraft --run\` to start the application.`);
  } catch (e) {
    spinner.stop('');
    p.log.error('Compilation failed. Check for errors above.');
    process.exit(1);
  }
}

function findServices(cwd) {
  const srcDir = path.join(cwd, 'src/main/java');
  if (!fs.existsSync(srcDir)) return [];
  
  const services = [];
  const pomContent = fs.readFileSync(path.join(cwd, 'pom.xml'), 'utf-8');
  const packagePath = pomContent.match(/<groupId>([^<]+)<\/groupId>/)?.[1]?.replace(/\./g, '/') || '';
  
  if (packagePath) {
    const servicePath = path.join(srcDir, packagePath);
    if (fs.existsSync(servicePath)) {
      const entries = fs.readdirSync(servicePath, { withFileTypes: true });
      services.push(...entries.filter(e => e.isDirectory()).map(e => e.name));
    }
  }
  
  return services;
}