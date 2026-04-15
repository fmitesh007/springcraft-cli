import fs from 'fs-extra';
import path from 'path';
import { HELLO_UI_STYLES, API_ROUTES } from '../../../shared/index.js';

export async function generateReactHelloUI(projectDir) {
  const routes = API_ROUTES.map(r => ({
    method: r.method,
    path: r.path,
    query: r.query || null,
  }));

  const appJsx = `import { useState } from 'react';

function formatJson(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
}

function App() {
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSayHello = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: 'Failed to connect to backend', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setName(''); setResponse(null); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{\`${HELLO_UI_STYLES.replace(/`/g, '\\`')}\`}</style>
      <div className="container">
        <div className="header">
          <h1>{name ? \`Hello, \${name}!\` : 'SpringCraft App'}</h1>
          <p>Your Spring Boot + React application is ready</p>
        </div>
        <div className="main-content">
          <div className="card">
            <h2>Say Hello</h2>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSayHello()} placeholder="Enter your name..." />
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleSayHello} disabled={loading}>{loading ? 'Loading...' : 'Say Hello'}</button>
              <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>
          <div className="card">
            <h2>Response</h2>
            <div className="response-area">
              {response ? <pre dangerouslySetInnerHTML={{ __html: formatJson(response) }} /> : <span style={{ color: '#71717a' }}>Response will appear here...</span>}
            </div>
          </div>
          <div className="card">
            <h2>Backend Routes</h2>
            <ul className="routes-list">
              {routes.map((route, i) => (
                <li key={i}><span className="route-path">{route.path}{route.query || ''}</span><span className={\`route-method method-\${route.method.toLowerCase()}\`}>{route.method}</span></li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>Frontend Routes</h2>
            <ul className="routes-list">
              <li><span className="route-path">/</span><span className="route-method method-get">GET</span></li>
            </ul>
          </div>
        </div>
        <div className="footer">Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a></div>
      </div>
    </div>
  );
}

export default App;
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.jsx'), appJsx);
}
