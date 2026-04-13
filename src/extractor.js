import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import os from 'os';

export async function extract(zipBuffer, projectName) {
  const destPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(destPath)) {
    throw new Error(`Directory already exists: ${projectName}`);
  }

  const tempZipPath = path.join(os.tmpdir(), `.__${projectName}_tmp.zip`);

  try {
    await fs.promises.writeFile(tempZipPath, zipBuffer);

    await new Promise((resolve, reject) => {
      const extraction = unzipper.Extract({ path: destPath });

      extraction.on('close', resolve);
      extraction.on('error', reject);

      fs.createReadStream(tempZipPath).pipe(extraction);
    });

    // Make wrapper scripts executable
    const wrappers = ['mvnw', 'gradlew'];
    for (const wrapper of wrappers) {
      const wrapperPath = path.join(destPath, wrapper);
      if (fs.existsSync(wrapperPath)) {
        await fs.promises.chmod(wrapperPath, 0o755);
      }
    }
  } finally {
    if (fs.existsSync(tempZipPath)) {
      await fs.promises.unlink(tempZipPath);
    }
  }
}
