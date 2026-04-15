import path from 'path';
import fs from 'fs-extra';

export function ensureProjectDir(targetPath, artifactId) {
  const projectDir = targetPath
    ? path.resolve(targetPath, artifactId)
    : path.resolve(process.cwd(), artifactId);
  
  fs.ensureDirSync(projectDir);
  
  if (targetPath) {
    process.chdir(targetPath);
  }
  
  return projectDir;
}

export function inferPackageName(groupId, artifactId) {
  return `${groupId}.${artifactId.replace(/[^a-zA-Z0-9]/g, '')}`;
}

export function inferGroupId(artifactId) {
  return `com.${artifactId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

export function yamlStringify(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      lines.push(yamlStringify(value, indent + 1));
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${pad}${key}: []`);
      } else {
        lines.push(`${pad}${key}:`);
        for (const item of value) {
          if (typeof item === 'object') {
            lines.push(`${pad}  - ${yamlStringify(item, indent + 2).trim()}`);
          } else {
            lines.push(`${pad}  - ${item}`);
          }
        }
      }
    } else {
      lines.push(`${pad}${key}: ${value}`);
    }
  }
  return lines.join('\n');
}

export function detectFrontendStack(projectDir) {
  const pkgPath = path.join(projectDir, 'frontend', 'package.json');
  
  if (!fs.existsSync(pkgPath)) return null;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    if (pkg.dependencies?.react || pkg.devDependencies?.react) return 'React';
    if (pkg.dependencies?.vue || pkg.devDependencies?.vue) return 'Vue';
    if (pkg.dependencies?.svelte || pkg.devDependencies?.svelte) return 'Svelte';
    if (pkg.dependencies?.['@angular/core']) return 'Angular';
    if (pkg.dependencies?.preact || pkg.devDependencies?.preact) return 'Preact';
    if (pkg.dependencies?.solid-js || pkg.devDependencies?.solid-js) return 'Solid';
    if (pkg.dependencies?.lit || pkg.devDependencies?.lit) return 'Lit';
  } catch (e) {}
  
  return null;
}
