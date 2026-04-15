import { HELLO_UI_STYLES } from '../../../shared/styles.js';
import { API_ROUTES, FRONTEND_ROUTES } from '../../../shared/routes.js';

export function generateRoutesList(routes, isBackend = true) {
  return routes.map(route => {
    const methodClass = `method-${route.method.toLowerCase()}`;
    return `{ method: '${route.method}', path: '${route.path}'${route.query ? `, query: '${route.query}'` : ''}, desc: '${route.desc}' }`;
  }).join(',\n    ');
}

export function generateRoutesJSX(routes, isBackend = true) {
  return routes.map((route, i) => `
            <li key={i}>
              <span class="route-path">${route.path}${route.query || ''}</span>
              <span class="route-method ${`method-${route.method.toLowerCase()}`}">${route.method}</span>
            </li>
`).join('');
}

export { HELLO_UI_STYLES, API_ROUTES, FRONTEND_ROUTES };
