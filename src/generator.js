import * as p from '@clack/prompts';
import { askQuestions } from './prompts.js';
import { downloadProject } from './downloader.js';
import { extract } from './extractor.js';

export async function run(projectName) {
  const answers = await askQuestions(projectName);

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

  const runCommand = answers.buildTool === 'gradle-project' || answers.buildTool === 'gradle-project-kotlin'
    ? './gradlew bootRun'
    : './mvnw spring-boot:run';

  p.outro(`✅ Project created successfully!

Next steps:
  cd ${answers.artifactId}
  ${runCommand}
`);
}
