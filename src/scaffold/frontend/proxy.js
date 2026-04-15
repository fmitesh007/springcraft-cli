import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../../shared/index.js';

export async function configureViteProxy(projectDir) {
  const viteConfigPath = path.join(projectDir, 'frontend', 'vite.config.js');

  if (!fs.existsSync(viteConfigPath)) {
    p.log.warn('vite.config.js not found, skipping proxy configuration.');
    return;
  }

  const proxyConfig = `
  server: {
    proxy: {
      '${CONFIG.VITE_PROXY_PATH}': {
        target: '${CONFIG.VITE_PROXY_TARGET}',
        changeOrigin: true,
      },
      '/auth': {
        target: '${CONFIG.VITE_PROXY_TARGET}',
        changeOrigin: true,
      },
    },
  },`;

  try {
    let config = await fs.readFile(viteConfigPath, 'utf-8');

    if (config.includes('proxy:')) {
      p.log.info('Proxy config already exists in vite.config.js');
      return;
    }

    config = config.replace(
      /export default defineConfig\(\{/,
      `export default defineConfig({${proxyConfig}`
    );

    await fs.writeFile(viteConfigPath, config);
    p.log.success(`Vite proxy configured: ${CONFIG.VITE_PROXY_PATH} → ${CONFIG.VITE_PROXY_TARGET}`);
  } catch (e) {
    p.log.warn('Could not configure Vite proxy. Configure manually if needed.');
  }
}
