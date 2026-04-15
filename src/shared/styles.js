// Shared Hello UI styles (dark gradient theme)

export const HELLO_UI_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #e4e4e7;
}
.container { 
  max-width: 800px; 
  margin: 0 auto; 
  padding: 2rem; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header { text-align: center; margin-bottom: 2rem; }
.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #6ee7b7, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
.header p { color: #a1a1aa; }
.main-content { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; }
.card h2 { font-size: 1rem; color: #a1a1aa; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; }
.form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.3); }
.btn-group { display: flex; gap: 0.75rem; }
.btn { flex: 1; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-secondary { background: rgba(255,255,255,0.1); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.2); }
.btn-secondary:hover { background: rgba(255,255,255,0.15); }
.response-area { background: rgba(0,0,0,0.3); border-radius: 0.5rem; padding: 1rem; font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.85rem; min-height: 100px; overflow-x: auto; }
.json-key { color: #93c5fd; }
.json-string { color: #86efac; }
.json-number { color: #fbbf24; }
.routes-list { list-style: none; }
.routes-list li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
.routes-list li:last-child { border-bottom: none; }
.route-path { font-family: 'Fira Code', monospace; color: #86efac; font-size: 0.85rem; }
.route-method { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.method-get { background: #22c55e; color: #000; }
.method-post { background: #3b82f6; color: #fff; }
.method-delete { background: #ef4444; color: #fff; }
.footer { text-align: center; padding: 2rem 0 1rem; color: #71717a; font-size: 0.875rem; }
.footer a { color: #3b82f6; text-decoration: none; }
.footer span { color: #ef4444; }
@media (max-width: 640px) { .main-content { grid-template-columns: 1fr; } .header h1 { font-size: 1.75rem; } }
`;
