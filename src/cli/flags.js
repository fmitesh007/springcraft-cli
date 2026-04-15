import path from 'path';

export function parseFlags(args) {
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
