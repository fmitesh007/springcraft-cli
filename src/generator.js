import * as p from '@clack/prompts';
import path from 'path';
import { askQuestions } from './prompts.js';
import { downloadProject } from './downloader.js';
import { extract } from './extractor.js';
import { runPostScaffold } from './postscaffold.js';
import { savePreset } from './presets.js';

export async function run(projectName, flags = {}) {
  const answers = await askQuestions(projectName, flags);
  const spinner = p.spinner();

  spinner.start('Downloading project template...');
  try {
    const zipBuffer = await downloadProject({ projectName, ...answers });
    spinner.stop('Download complete.');

    spinner.start('Extracting files...');
    await extract(zipBuffer, answers.artifactId);
    spinner.stop('Extraction complete.');
  } catch (error) {
    spinner.stop('Failed.');
    throw error;
  }

  const projectDir = path.resolve(process.cwd(), answers.artifactId);

  await runPostScaffold(projectDir, answers);

  const presetName = await p.text({ message: 'Save as preset? (leave blank to skip)', placeholder: '' });
  if (presetName && !p.isCancel(presetName) && presetName.trim() !== '') {
    await savePreset(presetName.trim(), answers);
    p.log.success(`Preset "${presetName}" saved.`);
  }

  const runCommand = answers.buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run';

  p.outro(`Project created successfully!

Next steps:
  cd ${answers.artifactId}
  ${runCommand}
`);
}
