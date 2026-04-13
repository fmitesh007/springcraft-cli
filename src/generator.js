import * as p from '@clack/prompts';
import path from 'path';
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
  const inCurrentDir = flags.inCurrentDir || false;

  if (inCurrentDir) {
    const dirName = path.basename(process.cwd());
    if (!flags.artifactId) {
      flags.artifactId = dirName;
    }
  }

  if (!flags.packageName && flags.groupId && flags.artifactId) {
    flags.packageName = `${flags.groupId}.${flags.artifactId}`;
  }

  let answers;

  if (hasAllRequired(flags) && flags.dependencies !== undefined) {
    console.log('\n  Using CLI flags - skipping prompts.\n');
    answers = { ...flags, dependencies: flags.dependencies || [] };

    if (flags.dryRun) {
      const url = buildUrl(answers);
      console.log('  Dry run - would call:\n');
      console.log(`  ${url}\n`);
      return;
    }
  } else {
    answers = await askQuestions(flags);
  }

  const projectDir = inCurrentDir ? process.cwd() : path.resolve(process.cwd(), answers.artifactId);

  const spinner = p.spinner();

  spinner.start('Downloading project template...');
  try {
    const zipBuffer = await downloadProject({ projectName: answers.artifactId, ...answers });
    spinner.stop('Download complete.');

    spinner.start('Extracting files...');
    await extract(zipBuffer, answers.artifactId, { inCurrentDir });
    spinner.stop('Extraction complete.');
  } catch (error) {
    spinner.stop('Failed.');
    throw error;
  }

  await runPostScaffold(projectDir, answers);

  const presetName = await p.text({ message: 'Save as preset? (leave blank to skip)', placeholder: '' });
  if (presetName && !p.isCancel(presetName) && presetName.trim() !== '') {
    await savePreset(presetName.trim(), answers);
    p.log.success(`Preset "${presetName}" saved.`);
  }

  const runCommand = answers.buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run';

  const cdCommand = inCurrentDir ? '' : `  cd ${answers.artifactId}\n`;

  p.outro(`Project created successfully!

Next steps:${cdCommand}
  ${runCommand}
`);
}
