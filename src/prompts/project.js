import * as p from '@clack/prompts';
import { CONFIG, inferGroupId, inferPackageName } from '../shared/index.js';

export async function askProjectQuestions(flags = {}) {
  p.intro('Create Spring Boot Project');

  const artifactId = await p.text({
    message: 'Project name:',
    placeholder: 'my-spring-app',
    default: flags.artifactId,
    validate: v => {
      if (!v?.trim()) return 'Required';
      if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(v)) return 'Letters, numbers, hyphens, underscores only';
    },
  });

  if (p.isCancel(artifactId)) { p.cancel('Cancelled.'); process.exit(0); }

  const arch = await p.select({
    message: 'Architecture:',
    options: [
      { value: 'fullstack', label: 'Fullstack (Monolithic)', hint: 'Backend + Frontend in one app' },
      { value: 'backend-only', label: 'Backend Only', hint: 'REST API / Microservice' },
    ],
    initialValue: flags.arch,
  });

  if (p.isCancel(arch)) { p.cancel('Cancelled.'); process.exit(0); }

  const autoGroupId = inferGroupId(artifactId);
  const autoPackageName = inferPackageName(autoGroupId, artifactId);

  const buildTool = await p.select({
    message: 'Build tool:',
    options: [
      { value: 'maven-project', label: 'Maven' },
      { value: 'gradle-project', label: 'Gradle (Groovy DSL)' },
      { value: 'gradle-project-kotlin', label: 'Gradle (Kotlin DSL)' },
    ],
    initialValue: flags.buildTool,
  });

  if (p.isCancel(buildTool)) { p.cancel('Cancelled.'); process.exit(0); }

  const language = await p.select({
    message: 'Language:',
    options: CONFIG.LANGUAGES.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) })),
    initialValue: flags.language,
  });

  if (p.isCancel(language)) { p.cancel('Cancelled.'); process.exit(0); }

  const springBootVersion = await p.select({
    message: 'Spring Boot version:',
    options: CONFIG.SPRING_BOOT_VERSIONS.map((v, i) => ({
      value: v,
      label: `${v}${i === 0 ? ' (recommended)' : ''}`
    })),
    initialValue: flags.springBootVersion,
  });

  if (p.isCancel(springBootVersion)) { p.cancel('Cancelled.'); process.exit(0); }

  const javaVersion = await p.select({
    message: 'Java version:',
    options: CONFIG.JAVA_VERSIONS.map((v, i) => ({
      value: v,
      label: `${v}${i === 0 ? ' (LTS, recommended)' : v === '21' ? ' (LTS)' : ''}`
    })),
    initialValue: flags.javaVersion,
  });

  if (p.isCancel(javaVersion)) { p.cancel('Cancelled.'); process.exit(0); }

  const groupIdInput = await p.text({
    message: 'Group ID:',
    placeholder: autoGroupId,
    default: flags.groupId || autoGroupId,
  });

  if (p.isCancel(groupIdInput)) { p.cancel('Cancelled.'); process.exit(0); }

  const groupId = groupIdInput?.trim() ? groupIdInput : autoGroupId;
  const groupIdForPackage = groupIdInput?.trim() || autoGroupId;

  const packageNameInput = await p.text({
    message: 'Package name:',
    placeholder: inferPackageName(groupIdForPackage, artifactId),
    default: flags.packageName || inferPackageName(groupIdForPackage, artifactId),
  });

  if (p.isCancel(packageNameInput)) { p.cancel('Cancelled.'); process.exit(0); }

  const packageName = packageNameInput?.trim() ? packageNameInput : inferPackageName(groupIdForPackage, artifactId);

  const descriptionInput = await p.text({
    message: 'Description:',
    placeholder: `Project ${artifactId}`,
    default: flags.description || `Project ${artifactId}`,
  });

  if (p.isCancel(descriptionInput)) { p.cancel('Cancelled.'); process.exit(0); }

  const description = descriptionInput?.trim() ? descriptionInput : `Project ${artifactId}`;

  const packaging = await p.select({
    message: 'Packaging:',
    options: [
      { value: 'jar', label: 'Jar (recommended)' },
      { value: 'war', label: 'War' },
    ],
    initialValue: flags.packaging,
  });

  if (p.isCancel(packaging)) { p.cancel('Cancelled.'); process.exit(0); }

  const configFormat = await p.select({
    message: 'Configuration format:',
    options: [
      { value: 'properties', label: 'Properties (.properties)', hint: 'Traditional config format' },
      { value: 'yaml', label: 'YAML (.yml)', hint: 'Recommended for nested config' },
    ],
    initialValue: flags.configFormat || 'yaml',
  });

  if (p.isCancel(configFormat)) { p.cancel('Cancelled.'); process.exit(0); }

  return {
    artifactId,
    arch,
    buildTool,
    language,
    springBootVersion,
    javaVersion,
    groupId,
    packageName,
    description,
    packaging,
    configFormat,
  };
}
