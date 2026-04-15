export const API_ROUTES = [
  { method: 'GET', path: '/api/hello', desc: 'Greet someone', query: '?name=World' },
  { method: 'GET', path: '/api/health', desc: 'Health check' },
  { method: 'POST', path: '/api/echo', desc: 'Echo back data' },
];

export const FRONTEND_ROUTES = [
  { method: 'GET', path: '/', desc: 'Home page' },
];

export function formatJsonSyntax(json) {
  if (!json) return '';
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\d+)/g, ': <span class="json-number">$1</span>');
}
