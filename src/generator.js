import * as p from '@clack/prompts';
import path from 'path';
import fs from 'fs-extra';
import { askQuestions } from './prompts.js';
import { downloadProject } from './downloader.js';
import { extract } from './extractor.js';
import { runPostScaffold } from './postscaffold.js';
import { savePreset } from './presets.js';

const SPRING_INITIALIZR_URL = 'https://start.spring.io/starter.zip';

const REQUIRED_FIELDS = ['buildTool', 'language', 'javaVersion', 'springBootVersion', 'groupId', 'artifactId', 'packageName', 'description', 'packaging'];

function hasAllRequired(flags) {
  return REQUIRED_FIELDS.every(field => !!flags[field]);
}

function buildUrl(options) {
  const {
    buildTool,
    language,
    javaVersion,
    springBootVersion,
    groupId,
    artifactId,
    packageName,
    description,
    packaging,
    dependencies,
  } = options;

  const params = new URLSearchParams({
    type: buildTool,
    language,
    javaVersion,
    bootVersion: springBootVersion,
    groupId,
    artifactId,
    name: artifactId,
    packageName,
    description,
    packaging,
    dependencies: dependencies.join(','),
  });

  return `${SPRING_INITIALIZR_URL}?${params.toString()}`;
}

export async function run(flags = {}) {
  const targetPath = flags.targetPath;

  if (targetPath) {
    fs.ensureDirSync(targetPath);
    process.chdir(targetPath);
    const dirName = path.basename(targetPath);
    if (!flags.artifactId) {
      flags.artifactId = dirName;
    }
  }

  if (!flags.packageName && flags.groupId && flags.artifactId) {
    flags.packageName = `${flags.groupId}.${flags.artifactId}`;
  }

  const defaults = {
    language: 'java',
    springBootVersion: '3.5.0',
    javaVersion: '17',
    packaging: 'jar',
    description: flags.artifactId || 'Spring Boot project',
  };

  const cliMode = flags.artifactId && flags.buildTool && flags.groupId && flags.packageName;

  let answers;

  if (cliMode) {
    const mergedFlags = { ...defaults, ...flags };
    console.log('\n  Using CLI flags - skipping prompts.\n');
    answers = {
      ...mergedFlags,
      dependencies: mergedFlags.dependencies || [],
    };

    if (flags.dryRun) {
      const url = buildUrl(answers);
      console.log('  Dry run - would call:\n');
      console.log(`  ${url}\n`);
      return;
    }
  } else {
    answers = await askQuestions(flags);
  }

  if (answers.arch === 'fullstack' && (!answers.dependencies || answers.dependencies.length === 0)) {
    answers.dependencies = ['web'];
  }

  const projectDir = targetPath
    ? path.resolve(targetPath, answers.artifactId)
    : path.resolve(process.cwd(), answers.artifactId);

  const spinner = p.spinner();

  spinner.start('Downloading project template...');
  try {
    const zipBuffer = await downloadProject({ projectName: answers.artifactId, ...answers });
    spinner.stop('Download complete.');

    spinner.start('Extracting files...');
    await extract(zipBuffer, answers.artifactId, { targetPath });
    spinner.stop('Extraction complete.');
  } catch (error) {
    spinner.stop('');
    console.error(`\n  ❌ ${error.message}\n`);
    process.exit(1);
  }

  await runPostScaffold(projectDir, answers);

  const presetName = await p.text({ message: 'Save as preset? (leave blank to skip)', placeholder: '' });
  if (presetName && !p.isCancel(presetName) && presetName.trim() !== '') {
    await savePreset(presetName.trim(), answers);
    p.log.success(`Preset "${presetName}" saved.`);
  }

  const runCommand = answers.buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run';
  const isFullstack = answers.arch === 'fullstack';

  const cdCommand = targetPath ? '' : `  cd ${answers.artifactId}\n`;

  let portInfo = '';
  if (isFullstack) {
    portInfo = `\nPorts:
  Backend:  http://localhost:8080
  Frontend: http://localhost:5173`;
  } else {
    portInfo = `\nPort:
  Backend:  http://localhost:8080`;
  }

  p.outro(`Project created successfully!${cdCommand}
  ${runCommand}${portInfo}

Run \`springcraft --help\` for available commands.
`);
}
