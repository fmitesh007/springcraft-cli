#!/usr/bin/env node

import { run as scaffold } from '../src/generator.js';
import { handleRun, handleBuild, handleDocker, handleInfo } from '../src/commands.js';
import { listPresets, loadPreset } from '../src/presets.js';
import path from 'path';

function parseFlags(args) {
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--run' || arg === '-r') {
      flags.run = true;
    } else if (arg === '--build' || arg === '-b') {
      flags.build = true;
    } else if (arg === '--frontend' || arg === '-f') {
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        flags.frontend = args[++i];
      }
    } else if (arg === '--dev' || arg === '-d') {
      flags.dev = true;
    } else if (arg === '--prod' || arg === '-p') {
      flags.prod = true;
    } else if (arg === '--docker') {
      flags.docker = true;
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        flags.dockerAction = args[++i];
      }
    } else if (arg === '--info' || arg === '-i') {
      flags.info = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--list-presets') {
      flags['list-presets'] = true;
    } else if (arg === '--preset') {
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        flags.preset = args[++i];
      }
    } else if (arg === '--arch') {
      if (i + 1 < args.length) flags.arch = args[++i];
    } else if (arg === '--build-tool') {
      if (i + 1 < args.length) flags.buildTool = args[++i];
    } else if (arg === '--language') {
      if (i + 1 < args.length) flags.language = args[++i];
    } else if (arg === '--java-version') {
      if (i + 1 < args.length) flags.javaVersion = args[++i];
    } else if (arg === '--spring-boot-version') {
      if (i + 1 < args.length) flags.springBootVersion = args[++i];
    } else if (arg === '--group-id') {
      if (i + 1 < args.length) flags.groupId = args[++i];
    } else if (arg === '--artifact-id') {
      if (i + 1 < args.length) flags.artifactId = args[++i];
    } else if (arg === '--package-name') {
      if (i + 1 < args.length) flags.packageName = args[++i];
    } else if (arg === '--description') {
      if (i + 1 < args.length) flags.description = args[++i];
    } else if (arg === '--packaging') {
      if (i + 1 < args.length) flags.packaging = args[++i];
    } else if (arg === '--dependencies') {
      if (i + 1 < args.length) {
        flags.dependencies = args[++i].split(',').filter(Boolean);
      }
    } else if (arg === '-h' || arg === '--help') {
      flags.help = true;
    } else if (arg === '-v' || arg === '--version') {
      flags.version = true;
    } else if (!arg.startsWith('-')) {
      flags.targetPath = arg === '.' ? process.cwd() : path.resolve(arg);
    }
  }

  return flags;
}

function showHelp() {
  console.log(`
springcraft - Modern CLI scaffolder for Spring Boot projects

Usage:
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
  console.log('springcraft v0.2.0');
}

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
