#!/usr/bin/env node

import { run } from '../src/generator.js';
import { loadPreset, listPresets } from '../src/presets.js';
import path from 'path';

function showHelp() {
  console.log(`
springcraft - Scaffold Spring Boot projects

Usage:
  springcraft .                            Create in current directory
  springcraft /path/to/project             Create in specific directory
  springcraft                              Interactive mode

Options:
  --maven|--gradle|--gradle-kotlin      Build tool
  --java|--kotlin|--groovy               Language
  --java-version <version>               Java version (11, 17, 21, 24)
  --boot <version>                      Spring Boot version (3.5.0, 3.4.5, 3.3.11, 3.2.12)
  --group <groupId>                     Group ID (e.g., com.example)
  --artifact <id>                       Artifact ID
  --package <name>                      Package name
  --desc "<description>"                Project description
  --jar|--war                           Packaging type
  --deps <dep1,dep2,...>               Dependencies
  --dry-run                             Show download URL without creating
  --preset <name>                      Use saved preset
  --list-presets                        List saved presets
  -h, --help                           Show this help
  -v, --version                        Show version

Examples:
  springcraft .                            Create in current directory
  springcraft ~/projects/my-api            Create in specific directory
  springcraft --maven --java --java-version 17 --deps web,data-jpa
  springcraft --preset my-preset
  springcraft --dry-run
`);
}

function showVersion() {
  console.log('springcraft v0.2.0');
}

function parseArgs(argv) {
  const flags = {};

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);

      case '-v':
      case '--version':
        showVersion();
        process.exit(0);

      case '--maven': flags.buildTool = 'maven-project'; break;
      case '--gradle': flags.buildTool = 'gradle-project'; break;
      case '--gradle-kotlin': flags.buildTool = 'gradle-project-kotlin'; break;
      case '--java': flags.language = 'java'; break;
      case '--kotlin': flags.language = 'kotlin'; break;
      case '--groovy': flags.language = 'groovy'; break;

      case '--java-version':
        if (i + 1 < argv.length) flags.javaVersion = argv[++i];
        break;
      case '--boot':
        if (i + 1 < argv.length) flags.springBootVersion = argv[++i];
        break;
      case '--group':
        if (i + 1 < argv.length) flags.groupId = argv[++i];
        break;
      case '--artifact':
        if (i + 1 < argv.length) flags.artifactId = argv[++i];
        break;
      case '--package':
        if (i + 1 < argv.length) flags.packageName = argv[++i];
        break;
      case '--desc':
      case '--description':
        if (i + 1 < argv.length) flags.description = argv[++i];
        break;
      case '--jar': flags.packaging = 'jar'; break;
      case '--war': flags.packaging = 'war'; break;
      case '--deps':
        if (i + 1 < argv.length) flags.dependencies = argv[++i].split(',').map(d => d.trim());
        break;
      case '--dry-run': flags.dryRun = true; break;
      case '--preset':
        if (i + 1 >= argv.length || argv[i + 1].startsWith('-')) {
          console.error('Error: --preset requires a preset name');
          console.error('Run: springcraft --list-presets to see available presets');
          process.exit(1);
        }
        const presetName = argv[++i];
        const preset = loadPreset(presetName);
        if (preset) {
          Object.assign(flags, preset);
        } else {
          console.error(`Preset "${presetName}" not found.`);
          process.exit(1);
        }
        break;
      case '--list-presets':
        const presets = listPresets();
        if (presets.length === 0) {
          console.log('No presets found.');
        } else {
          console.log('Available presets:');
          presets.forEach(p => console.log(`  - ${p}`));
        }
        process.exit(0);

      default:
        if (arg === '.' || arg.startsWith('/') || arg.startsWith('~') || arg.startsWith('./')) {
          const targetPath = arg === '.' ? process.cwd() : path.resolve(arg);
          flags.targetPath = targetPath;
        }
    }
  }

  return flags;
}

const flags = parseArgs(process.argv);

try {
  run(flags);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
