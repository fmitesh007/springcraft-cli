import fs from 'fs-extra';
import path from 'path';
import { HELLO_UI_STYLES, API_ROUTES } from '../../../shared/index.js';

export async function generateSolidHelloUI(projectDir) {
  const appJsx = `import { createSignal } from 'solid-js';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
}

const styles = \`${HELLO_UI_STYLES.replace(/`/g, '\\`')}\`;

function App() {
  const [name, setName] = createSignal('');
  const [response, setResponse] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const greeting = () => name() ? \`Hello, \${name()}!\` : 'SpringCraft App';

  const handleSayHello = async () => {
    if (!name().trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name())}\`);
      const data = await res.json();
      setResponse(data);
    } catch (err) { setResponse({ error: 'Failed', details: err.message }); }
    finally { setLoading(false); }
  };

  const handleClear = () => { setName(''); setResponse(null); };

  const routes = [${API_ROUTES.map(r => `{ method: '${r.method}', path: '${r.path}' }`).join(', ')}];

  return (
    <div style={{ "min-height": "100vh", display: "flex", "flex-direction": "column" }}>
      <style>{styles}</style>
      <div class="container">
        <div class="header">
          <h1>{greeting()}</h1>
          <p>Your Spring Boot + Solid application is ready</p>
        </div>
        <div class="main-content">
          <div class="card">
            <h2>Say Hello</h2>
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" value={name()} onInput={(e) => setName(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && handleSayHello()} placeholder="Enter your name..." />
            </div>
            <div class="btn-group">
              <button class="btn btn-primary" onClick={handleSayHello} disabled={loading()}>{loading() ? 'Loading...' : 'Say Hello'}</button>
              <button class="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>
          <div class="card">
            <h2>Response</h2>
            <div class="response-area">
              {response() ? <pre innerHTML={formatJson(response())} /> : <span style={{ color: '#71717a' }}>Response will appear here...</span>}
            </div>
          </div>
          <div class="card">
            <h2>Backend Routes</h2>
            <ul class="routes-list">
              {routes.map((route, i) => <li key={i}><span class="route-path">{route.path}</span><span class={\`route-method method-\${route.method.toLowerCase()}\`}>{route.method}</span></li>)}
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
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.jsx'), appJsx);
}
