import fs from 'fs-extra';
import path from 'path';
import { API_ROUTES } from '../../../shared/index.js';

const angularStyles = `
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
.form-group input:focus { outline: none; border-color: #3b82f6; }
.btn-group { display: flex; gap: 0.75rem; }
.btn { flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
.btn-secondary { background: rgba(255,255,255,0.1); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); }
.response-area { background: rgba(0,0,0,0.3); border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.85rem; min-height: 100px; }
.routes-list { list-style: none; }
.routes-list li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; }
.route-path { color: #86efac; font-family: monospace; }
.route-method { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: #22c55e; color: #000; }
.method-post { background: #3b82f6; color: #fff; }
.footer { text-align: center; padding: 2rem 0 1rem; color: #71717a; }
.footer span { color: #ef4444; }
.footer a { color: #3b82f6; }
`;

export async function generateAngularHelloUI(projectDir) {
  const appComponentTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  name = '';
  response: any = null;
  loading = false;
  formattedResponse = '';

  get greeting() { return this.name ? \`Hello, \${this.name}!\` : 'SpringCraft App'; }

  routes = [${API_ROUTES.map(r => `{ method: '${r.method}', path: '${r.path}' }`).join(', ')}];

  async handleSayHello() {
    if (!this.name.trim()) return;
    this.loading = true;
    try {
      const res = await fetch(\`/api/hello?name=\${encodeURIComponent(this.name)}\`);
      this.response = await res.json();
      this.formattedResponse = JSON.stringify(this.response, null, 2);
    } catch (err: any) { this.response = { error: 'Failed', details: err.message }; this.formattedResponse = JSON.stringify(this.response); }
    finally { this.loading = false; }
  }

  handleClear() { this.name = ''; this.response = null; this.formattedResponse = ''; }
}
`;

  const appComponentHtml = `<div class="container">
  <div class="header">
    <h1>{{ greeting }}</h1>
    <p>Your Spring Boot + Angular application is ready</p>
  </div>
  <div class="main-content">
    <div class="card">
      <h2>Say Hello</h2>
      <div class="form-group">
        <label>Your Name</label>
        <input type="text" [(ngModel)]="name" (keyup.enter)="handleSayHello()" placeholder="Enter your name..." />
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" (click)="handleSayHello()" [disabled]="loading">{{ loading ? 'Loading...' : 'Say Hello' }}</button>
        <button class="btn btn-secondary" (click)="handleClear()">Clear</button>
      </div>
    </div>
    <div class="card">
      <h2>Response</h2>
      <div class="response-area"><pre *ngIf="formattedResponse">{{ formattedResponse }}</pre><span *ngIf="!formattedResponse" style="color: #71717a">Response will appear here...</span></div>
    </div>
    <div class="card">
      <h2>Backend Routes</h2>
      <ul class="routes-list">
        @for (route of routes; track route.path) {
          <li><span class="route-path">{{ route.path }}</span><span class="route-method">{{ route.method }}</span></li>
        }
      </ul>
    </div>
    <div class="card">
      <h2>Frontend Routes</h2>
      <ul class="routes-list">
        <li><span class="route-path">/</span><span class="route-method">GET</span></li>
      </ul>
    </div>
  </div>
  <div class="footer">Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a></div>
</div>
`;

  const frontendSrc = path.join(projectDir, 'frontend', 'src', 'app');
  await fs.ensureDir(frontendSrc);
  
  await fs.writeFile(path.join(frontendSrc, 'app.component.ts'), appComponentTs);
  await fs.writeFile(path.join(frontendSrc, 'app.component.html'), appComponentHtml);
  await fs.writeFile(path.join(frontendSrc, 'app.component.css'), angularStyles);
}
