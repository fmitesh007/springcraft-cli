import fs from 'fs-extra';
import unzipper from 'unzipper';
import { Readable } from 'stream';

export async function extract(buffer, projectName, options = {}) {
  const { targetPath } = options;
  const directory = await unzipper.Open.buffer(Buffer.from(buffer));
  
  const targetDir = targetPath || process.cwd();
  
  for (const file of directory.files) {
    const filePath = file.path;
    
    // Remove the first directory component (project name wrapper)
    const parts = filePath.split('/');
    if (parts.length > 1 && parts[0] === projectName) {
      parts.shift();
    }
    const newPath = parts.join('/');
    
    if (!newPath || newPath === projectName) continue;
    
    const destPath = `${targetDir}/${newPath}`;
    
    if (file.type === 'Directory') {
      await fs.ensureDir(destPath);
    } else {
      await fs.ensureDir(destPath.replace(/[^/]+$/, ''));
      const content = await file.buffer();
      await fs.writeFile(destPath, content);
    }
  }
}
