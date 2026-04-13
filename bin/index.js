#!/usr/bin/env node

import { run } from '../src/generator.js';
import { loadPreset } from '../src/presets.js';

const VALID_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9-_]*$/;

function parseArgs(argv) {
  const flags = {};
  const args = [];

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '--maven': flags.buildTool = 'maven-project'; break;
      case '--gradle': flags.buildTool = 'gradle-project'; break;
      case '--gradle-kotlin': flags.buildTool = 'gradle-project-kotlin'; break;
      case '--java': flags.language = 'java'; break;
      case '--kotlin': flags.language = 'kotlin'; break;
      case '--groovy': flags.language = 'groovy'; break;
      case '--java-version':
        flags.javaVersion = argv[++i];
        break;
      case '--boot':
        flags.springBootVersion = argv[++i];
        break;
      case '--group':
        flags.groupId = argv[++i];
        break;
      case '--artifact':
        flags.artifactId = argv[++i];
        break;
      case '--package':
        flags.packageName = argv[++i];
        break;
      case '--desc':
        flags.description = argv[++i];
        break;
      case '--jar': flags.packaging = 'jar'; break;
      case '--war': flags.packaging = 'war'; break;
      case '--deps':
        flags.dependencies = argv[++i].split(',').map(d => d.trim());
        break;
      case '--dry-run': flags.dryRun = true; break;
      case '--preset':
        const presetName = argv[++i];
        const preset = loadPreset(presetName);
        if (preset) {
          Object.assign(flags, preset);
        } else {
          console.error(`Preset "${presetName}" not found.`);
          process.exit(1);
        }
        break;
      default:
        if (!arg.startsWith('-')) args.push(arg);
    }
  }

  return { projectName: args[0], flags };
}

const { projectName, flags } = parseArgs(process.argv);

if (!projectName || !VALID_NAME_PATTERN.test(projectName)) {
  console.error('Usage: create-spring-app <project-name> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --maven|--gradle|--gradle-kotlin    Build tool');
  console.error('  --java|--kotlin|--groovy            Language');
  console.error('  --java-version <17|21|11|24>        Java version');
  console.error('  --boot <3.5.0|3.4.5|3.3.11|3.2.12>  Spring Boot version');
  console.error('  --group <groupId>                   Group ID');
  console.error('  --artifact <artifactId>             Artifact ID');
  console.error('  --package <packageName>             Package name');
  console.error('  --desc "<description>"              Description');
  console.error('  --jar|--war                         Packaging');
  console.error('  --deps <dep1,dep2,...>             Dependencies');
  console.error('  --dry-run                           Dry run mode');
  console.error('  --preset <name>                    Use saved preset');
  process.exit(1);
}

try {
  await run(projectName, flags);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
