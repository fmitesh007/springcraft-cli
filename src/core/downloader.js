import { CONFIG, buildSpringInitializrUrl } from '../shared/config.js';

export async function downloadProject(options) {
  const url = buildSpringInitializrUrl(options);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download project: ${response.status} ${response.statusText}`);
  }
  
  return response.arrayBuffer();
}
