import fs from 'fs-extra';
import path from 'path';
import { HELLO_UI_STYLES, API_ROUTES } from '../../../shared/index.js';

export async function generateSvelteHelloUI(projectDir) {
  const appSvelte = `<script>
  let name = '';
  let response = null;
  let loading = false;

  $: greeting = name ? \`Hello, \${name}!\` : 'SpringCraft App';

  const routes = [${API_ROUTES.map(r => `{ method: '${r.method}', path: '${r.path}' }`).join(', ')}];

  async function handleSayHello() {
    if (!name.trim()) return;
    loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
      response = await res.json();
    } catch (err) { response = { error: 'Failed to connect', details: err.message }; }
    finally { loading = false; }
  }

  function handleClear() { name = ''; response = null; }

  function formatJson(json) {
    if (!json) return '';
    return JSON.stringify(json, null, 2)
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
  }
</script>

<div class="app-container">
  <div class="container">
    <div class="header">
      <h1>{greeting}</h1>
      <p>Your Spring Boot + Svelte application is ready</p>
    </div>
    <div class="main-content">
      <div class="card">
        <h2>Say Hello</h2>
        <div class="form-group">
          <label for="name-input">Your Name</label>
          <input id="name-input" type="text" bind:value={name} placeholder="Enter your name..." on:keydown={(e) => e.key === 'Enter' && handleSayHello()} />
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" on:click={handleSayHello} disabled={loading}>{loading ? 'Loading...' : 'Say Hello'}</button>
          <button class="btn btn-secondary" on:click={handleClear}>Clear</button>
        </div>
      </div>
      <div class="card">
        <h2>Response</h2>
        <div class="response-area">
          {#if response}<pre>{@html formatJson(response)}</pre>{:else}<span style="color: #71717a">Response will appear here...</span>{/if}
        </div>
      </div>
      <div class="card">
        <h2>Backend Routes</h2>
        <ul class="routes-list">
          {#each routes as route, i}
            <li><span class="route-path">{route.path}</span><span class="route-method method-{route.method.toLowerCase()}">{route.method}</span></li>
          {/each}
        </ul>
      </div>
      <div class="card">
        <h2>Frontend Routes</h2>
        <ul class="routes-list">
          <li><span class="route-path">/</span><span class="route-method method-get">GET</span></li>
        </ul>
      </div>
    </div>
    <div class="footer">Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a></div>
  </div>
</div>
</script>

<style>
${HELLO_UI_STYLES}
</style>
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.svelte'), appSvelte);
}
