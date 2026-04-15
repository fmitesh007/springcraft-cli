import { HELLO_UI_STYLES, API_ROUTES, FRONTEND_ROUTES, formatJsonSyntax } from '../index.js';

export { HELLO_UI_STYLES, API_ROUTES, FRONTEND_ROUTES, formatJsonSyntax };

export const HELLO_UI_CONFIG = {
  title: 'SpringCraft App',
  greetingPrefix: 'Hello, ',
  backendName: 'Spring Boot',
  frontendName: 'Vue',
  apiEndpoint: '/api/hello',
  apiQueryParam: 'name',
  footer: {
    text: 'Built with love using',
    link: 'https://github.com/fmitesh/springcraft',
    linkText: 'springcraft',
  },
};

export const TEMPLATE_HELPERS = {
  formatRoutesForJS: (routes) => routes.map(r => ({
    method: r.method,
    path: r.path,
    query: r.query || null,
  })),
  
  formatRoutesForVue: (routes) => routes.map(r => ({
    method: r.method,
    path: r.path,
  })),
  
  getAppContent: (framework) => {
    const templates = {
      react: 'App.jsx',
      vue: 'App.vue', 
      svelte: 'App.svelte',
      angular: 'app.component.ts',
      preact: 'app.jsx',
      solid: 'App.jsx',
      lit: 'my-element.js',
    };
    return templates[framework] || 'App.jsx';
  },
};
