import fs from 'fs-extra';
import path from 'path';
import { API_ROUTES } from '../../../shared/index.js';

const litStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:host { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; color: #e4e4e7; display: block; }
.container { max-width: 800px; margin: 0 auto; padding: 2rem; display: flex; flex-direction: column; min-height: 100vh; }
.header { text-align: center; margin-bottom: 2rem; }
.header h1 { font-size: 2.5rem; font-weight: 700; background: linear-gradient(90deg, #6ee7b7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
.header p { color: #a1a1aa; }
.main-content { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; }
.card h2 { font-size: 1rem; color: #a1a1aa; margin-bottom: 1rem; text-transform: uppercase; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; }
.btn-group { display: flex; gap: 0.75rem; }
.btn { flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
.btn-secondary { background: rgba(255,255,255,0.1); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); }
.response-area { background: rgba(0,0,0,0.3); border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.85rem; min-height: 100px; }
.routes-list { list-style: none; }
.routes-list li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; }
.route-path { color: #86efac; font-family: monospace; }
.route-method { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; background: #22c55e; color: #000; }
.method-post { background: #3b82f6; color: #fff; }
.footer { text-align: center; padding: 2rem 0 1rem; color: #71717a; }
.footer span { color: #ef4444; }
`;

export async function generateLitHelloUI(projectDir) {
  const myElement = `import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css\`${litStyles}\`;

  @state() name = '';
  @state() response = null;
  @state() loading = false;

  get greeting() { return this.name ? \`Hello, \${this.name}!\` : 'SpringCraft App'; }

  routes = [${API_ROUTES.map(r => `{ method: '${r.method}', path: '${r.path}' }`).join(', ')}];

  async handleSayHello() {
    if (!this.name.trim()) return;
    this.loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(this.name)}\`);
      this.response = await res.json();
    } catch (err) { this.response = { error: 'Failed', details: err.message }; }
    finally { this.loading = false; }
  }

  handleClear() { this.name = ''; this.response = null; }

  render() {
    return html\`
      <div class="container">
        <div class="header"><h1>\${this.greeting}</h1><p>Your Spring Boot + Lit application is ready</p></div>
        <div class="main-content">
          <div class="card">
            <h2>Say Hello</h2>
            <div class="form-group"><label>Your Name</label>
              <input type="text" .value=\${this.name} @input=\${(e) => this.name = e.target.value} @keyup.enter=\${this.handleSayHello} placeholder="Enter your name..." />
            </div>
            <div class="btn-group">
              <button class="btn btn-primary" @click=\${this.handleSayHello} ?disabled=\${this.loading}>\${this.loading ? 'Loading...' : 'Say Hello'}</button>
              <button class="btn btn-secondary" @click=\${this.handleClear}>Clear</button>
            </div>
          </div>
          <div class="card">
            <h2>Response</h2>
            <div class="response-area">\${this.response ? html\`<pre>\${JSON.stringify(this.response, null, 2)}</pre>\` : html\`<span style="color: #71717a">Response will appear here...</span>\`}</div>
          </div>
          <div class="card">
            <h2>Backend Routes</h2>
            <ul class="routes-list">\${this.routes.map(r => html\`<li><span class="route-path">\${r.path}</span><span class="route-method">\${r.method}</span></li>\`)}</ul>
          </div>
          <div class="card">
            <h2>Frontend Routes</h2>
            <ul class="routes-list"><li><span class="route-path">/</span><span class="route-method">GET</span></li></ul>
          </div>
        </div>
        <div class="footer">Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a></div>
      </div>
    \`;
  }
}
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'my-element.ts'), myElement);
  
  const mainTs = `import './my-element';
import { html, render } from 'lit';
render(html\`<my-element></my-element>\`, document.body);
`;
  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'main.ts'), mainTs);
}
