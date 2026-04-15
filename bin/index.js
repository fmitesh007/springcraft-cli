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
      flags.frontend = true;
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
    } else if (arg === '-h' || arg === '--help') {
      flags.help = true;
    } else if (arg === '-v' || arg === '--version') {
      flags.version = true;
    } else if (arg === '--maven') {
      flags.buildTool = 'maven-project';
    } else if (arg === '--gradle') {
      flags.buildTool = 'gradle-project';
    } else if (arg === '--gradle-kotlin') {
      flags.buildTool = 'gradle-project-kotlin';
    } else if (arg === '--java') {
      flags.language = 'java';
    } else if (arg === '--kotlin') {
      flags.language = 'kotlin';
    } else if (arg === '--groovy') {
      flags.language = 'groovy';
    } else if (arg === '--java-version') {
      if (i + 1 < args.length) flags.javaVersion = args[++i];
    } else if (arg === '--boot') {
      if (i + 1 < args.length) flags.springBootVersion = args[++i];
    } else if (arg === '--group') {
      if (i + 1 < args.length) flags.groupId = args[++i];
    } else if (arg === '--artifact') {
      if (i + 1 < args.length) flags.artifactId = args[++i];
    } else if (arg === '--package') {
      if (i + 1 < args.length) flags.packageName = args[++i];
    } else if (arg === '--desc' || arg === '--description') {
      if (i + 1 < args.length) flags.description = args[++i];
    } else if (arg === '--jar') {
      flags.packaging = 'jar';
    } else if (arg === '--war') {
      flags.packaging = 'war';
    } else if (arg === '--deps') {
      if (i + 1 < args.length) flags.dependencies = args[++i].split(',').map(d => d.trim());
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
  springcraft <path>                     Scaffold a new Spring Boot project
  springcraft --run                       Run backend (Spring Boot)
  springcraft --run --frontend            Run frontend dev server
  springcraft --run --dev                 Run backend + frontend concurrently
  springcraft --build                     Build the project
  springcraft --build --prod              Build frontend + package jar
  springcraft --docker up                Start Docker services
  springcraft --docker down               Stop Docker services
  springcraft --docker logs               View Docker logs
  springcraft --info                      Show project info
  springcraft --list-presets              List saved presets
  springcraft --preset <name>             Scaffold with a saved preset
  springcraft --dry-run                   Show Initializr URL without downloading
  springcraft --help                      Show this help
  springcraft --version                   Show version

Scaffold Options:
  --maven|--gradle|--gradle-kotlin       Build tool
  --java|--kotlin|--groovy               Language
  --java-version <version>               Java version (11, 17, 21, 24)
  --boot <version>                       Spring Boot version
  --group <groupId>                      Group ID (e.g., com.example)
  --artifact <id>                        Artifact ID
  --package <name>                       Package name
  --deps <dep1,dep2,...>                Dependencies

Examples:
  springcraft .                           Create in current directory
  springcraft ~/projects/my-api           Create in specific directory
  springcraft --run                       Run from project directory
  springcraft --run --dev                 Run both backend and frontend
  springcraft --docker up                 Start Docker services
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
