import { run as scaffold } from '../core/generator.js';
import { handleRun, handleBuild, handleDocker, handleInfo, handleAddDeps, handleAddService, handleCompileService } from '../commands/index.js';
import { listPresets, loadPreset } from '../presets.js';
import { parseFlags } from './flags.js';

function showHelp() {
  console.log(`
springcraft - Modern CLI scaffolder for Spring Boot projects

Commands:
  springcraft .                           Scaffold project (interactive prompts)
  springcraft <path>                     Scaffold in specific directory
  springcraft --run                       Run backend (Spring Boot)
  springcraft --run --frontend            Run frontend only
  springcraft --run --dev                 Run both (backend + frontend)
  springcraft --build                     Build project
  springcraft --build --prod             Production build
  springcraft --docker up                Start Docker services
  springcraft --docker down               Stop Docker services
  springcraft --docker logs               View Docker logs
  springcraft --info                      Show project info
  springcraft --list-presets              List saved presets
  springcraft --preset <name>            Use saved preset
  springcraft --add-dep                   Add dependencies to existing project
  springcraft --add-service               Add new microservice to project
  springcraft --compile-service           Compile a service in the project
  springcraft --dry-run                   Show URL without downloading
  springcraft --help                      Show this help
  springcraft --version                   Show version

Non-interactive flags (for automation):
  --arch <fullstack|backend-only>
  --frontend <react|vue|svelte|angular|preact|solid|lit|none>
  --build-tool <maven-project|gradle-project|gradle-project-kotlin>
  --language <java|kotlin|groovy>
  --java-version <17|21|11|24>
  --spring-boot-version <3.5.0|3.4.5|3.3.11|3.2.12>
  --group-id <com.example>
  --artifact-id <my-app>
  --package-name <com.example.myapp>
  --description <description>
  --packaging <jar|war>
  --dependencies <web,data-jpa,lombok,...>

Example (fully non-interactive):
  springcraft /path/to/project --arch fullstack --frontend react --build-tool maven-project --java-version 17 --dependencies web,data-jpa --group-id com.example --package-name com.example.myapp --description "My App" --packaging jar

Ports:
  Backend:  http://localhost:8080
  Frontend: http://localhost:5173
`);
}

function showVersion() {
  console.log('springcraft v0.3.0');
}

export async function cli() {
  const args = process.argv.slice(2);
  const flags = parseFlags(args);

  if (flags.version) {
    showVersion();
    process.exit(0);
  }

  if (flags.help) {
    showHelp();
    process.exit(0);
  }

  if (flags['list-presets']) {
    const presets = listPresets();
    if (presets.length === 0) {
      console.log('No presets found.');
    } else {
      console.log('Available presets:');
      presets.forEach(p => console.log(`  - ${p}`));
    }
    process.exit(0);
  }

  if (flags.run) {
    handleRun(flags);
    process.exit(0);
  }

  if (flags.build) {
    handleBuild(flags);
    process.exit(0);
  }

  if (flags.docker) {
    handleDocker(flags, args);
    process.exit(0);
  }

  if (flags.info) {
    handleInfo();
    process.exit(0);
  }

  if (flags.addDeps) {
    await handleAddDeps();
    process.exit(0);
  }

  if (flags.addService) {
    await handleAddService();
    process.exit(0);
  }

  if (flags.compileService) {
    await handleCompileService();
    process.exit(0);
  }

  const cliFlags = { ...flags };

  if (cliFlags.preset) {
    const preset = loadPreset(cliFlags.preset);
    if (preset) {
      Object.assign(cliFlags, preset);
    } else {
      console.error(`Preset "${cliFlags.preset}" not found.`);
      process.exit(1);
    }
  }

  try {
    scaffold(cliFlags);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
