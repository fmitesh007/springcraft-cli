import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('Bundling with esbuild...');
execSync('npx esbuild bin/index.js --bundle --platform=node --outfile=dist/bundle.cjs --format=cjs --external:@clack/prompts --external:fs-extra --external:unzipper', { stdio: 'inherit' });

console.log('\nBuilding binaries with pkg...');

const targets = [
  { name: 'linux', flag: 'node18-linux-x64' },
  { name: 'macos', flag: 'node18-macos-x64' },
  { name: 'win', flag: 'node18-win-x64' }
];

for (const target of targets) {
  const outputName = target.name === 'win' ? 'springcraft-win.exe' : `springcraft-${target.name}`;
  console.log(`\nBuilding ${outputName}...`);
  try {
    execSync(`npx pkg dist/bundle.cjs --targets ${target.flag} -o dist/${outputName}`, { stdio: 'inherit' });
    console.log(`✓ ${outputName} built`);
  } catch (e) {
    console.error(`✗ Failed to build ${outputName}`);
  }
}

console.log('\n✓ Build complete!');
console.log('Binaries in dist/ directory');
