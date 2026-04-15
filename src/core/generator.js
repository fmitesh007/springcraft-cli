import * as p from '@clack/prompts';
import path from 'path';
import fs from 'fs-extra';
import { downloadProject } from './downloader.js';
import { extract } from './extractor.js';
import { askProjectQuestions, askDependencies } from '../prompts/index.js';
import { runPostScaffold } from '../scaffold/index.js';
import { savePreset } from '../presets.js';
import { CONFIG, getRunCommand, ensureProjectDir, inferPackageName, inferGroupId } from '../shared/index.js';

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
    flags.packageName = inferPackageName(flags.groupId, flags.artifactId);
  }

  const defaults = {
    language: CONFIG.DEFAULTS.language,
    springBootVersion: CONFIG.DEFAULTS.springBootVersion,
    javaVersion: CONFIG.DEFAULTS.javaVersion,
    packaging: CONFIG.DEFAULTS.packaging,
    description: flags.artifactId || 'Spring Boot project',
  };

  const cliMode = CONFIG.REQUIRED_CLI_FIELDS.every(field => !!flags[field]);

  let answers;

  if (cliMode) {
    const mergedFlags = { ...defaults, ...flags };
    console.log('\n  Using CLI flags - skipping prompts.\n');
    answers = {
      ...mergedFlags,
      dependencies: mergedFlags.dependencies || [],
      _cliMode: true,
    };

    if (flags.dryRun) {
      const { buildSpringInitializrUrl } = await import('../shared/config.js');
      const url = buildSpringInitializrUrl(answers);
      console.log('  Dry run - would call:\n');
      console.log(`  ${url}\n`);
      return;
    }
  } else {
    answers = await askProjectQuestions(flags);
    answers.dependencies = await askDependencies(flags.dependencies);
  }

  if (answers.arch === 'fullstack' && (!answers.dependencies || answers.dependencies.length === 0)) {
    answers.dependencies = ['web'];
  }

  // When targetPath is provided, project files are extracted directly there (no artifactId subdirectory)
  const projectDir = targetPath
    ? path.resolve(targetPath)
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

  if (!cliMode) {
    const presetName = await p.text({ message: 'Save as preset? (leave blank to skip)', placeholder: '' });
    if (presetName && !p.isCancel(presetName) && presetName.trim() !== '') {
      await savePreset(presetName.trim(), answers);
      p.log.success(`Preset "${presetName}" saved.`);
    }
  }

  const runCommand = getRunCommand(answers.buildTool);
  const isFullstack = answers.arch === 'fullstack';

  const cdCommand = targetPath ? '' : `  cd ${answers.artifactId}\n`;

  let portInfo = '';
  if (isFullstack) {
    portInfo = `\nPorts:
  Backend:  http://localhost:${CONFIG.BACKEND_PORT}
  Frontend: http://localhost:${CONFIG.FRONTEND_PORT}`;
  } else {
    portInfo = `\nPort:
  Backend:  http://localhost:${CONFIG.BACKEND_PORT}`;
  }

  p.outro(`Project created successfully!${cdCommand}
  ${runCommand}${portInfo}

Run \`springcraft --help\` for available commands.
`);
}
