import * as p from '@clack/prompts';
import * as readline from 'readline';
import { CONFIG } from '../shared/index.js';

function fuzzyMatch(text, query) {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return t.includes(q);
}

async function fzfSearch(deps) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    let query = '', cursor = 0, selected = new Set(), filtered = [...deps];

    function render() {
      filtered = deps.filter(d => fuzzyMatch(d.label, query) || fuzzyMatch(d.value, query) || fuzzyMatch(d.hint, query));
      console.clear();
      console.log('\n  FZF-style Dependency Search');
      console.log('─'.repeat(50));
      console.log(`  Query: ${query || '(empty)'}`);
      console.log(`  Selected: ${selected.size} | Results: ${filtered.length}`);
      console.log('─'.repeat(50));
      console.log('\n  up/down navigate  space toggle  enter confirm  esc skip\n');
      const start = Math.max(0, cursor - 10);
      const end = Math.min(filtered.length, start + 20);
      for (let i = start; i < end; i++) {
        const d = filtered[i];
        const mark = selected.has(d.value) ? '[x]' : '[ ]';
        const prefix = i === cursor ? ' > ' : '   ';
        console.log(`${prefix}${mark} ${d.label.padEnd(30)} ${d.hint}`);
      }
      if (filtered.length === 0) console.log('  (no results)');
      console.log('');
    }

    render();

    const handleKeypress = (str, key) => {
      if (key.ctrl && key.name === 'c') { cleanup(); resolve([]); return; }
      if (key.name === 'escape' || key.name === 'return' || key.name === 'enter') { cleanup(); resolve(Array.from(selected)); return; }
      if (key.name === 'up') { cursor = Math.max(0, cursor - 1); render(); return; }
      if (key.name === 'down') { cursor = Math.min(filtered.length - 1, cursor + 1); render(); return; }
      if (key.name === 'space') {
        const item = filtered[cursor];
        if (item) { selected.has(item.value) ? selected.delete(item.value) : selected.add(item.value); cursor = Math.min(filtered.length, cursor + 1); render(); }
        return;
      }
      if (key.name === 'backspace') { query = query.slice(0, -1); cursor = 0; render(); return; }
      if (str && str.length === 1 && !key.ctrl && !key.meta) { query += str; cursor = 0; render(); }
    };

    function cleanup() {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      rl.close();
    }

    process.stdin.on('keypress', handleKeypress);
  });
}

const ALL_DEPS = [
  { label: '[DEVTOOLS] devtools', value: 'devtools', hint: 'Hot reload', category: 'devtools' },
  { label: '[DEVTOOLS] lombok', value: 'lombok', hint: 'Boilerplate reducer', category: 'devtools' },
  { label: '[DEVTOOLS] docker-compose', value: 'docker-compose', hint: 'Docker Compose support', category: 'devtools' },
  { label: '[DEVTOOLS] spring-shell', value: 'spring-shell', hint: 'Interactive CLI apps', category: 'devtools' },
  { label: '[DEVTOOLS] configuration-processor', value: 'configuration-processor', hint: 'Metadata for @ConfigurationProperties', category: 'devtools' },
  { label: '[WEB] web', value: 'web', hint: 'Spring MVC, REST, Tomcat', category: 'web' },
  { label: '[WEB] webflux', value: 'webflux', hint: 'Reactive web with Netty', category: 'web' },
  { label: '[WEB] graphql', value: 'graphql', hint: 'Spring for GraphQL', category: 'web' },
  { label: '[WEB] websocket', value: 'websocket', hint: 'WebSocket support', category: 'web' },
  { label: '[WEB] jersey', value: 'jersey', hint: 'JAX-RS with Jersey', category: 'web' },
  { label: '[WEB] hateoas', value: 'hateoas', hint: 'Hypermedia REST (HAL)', category: 'web' },
  { label: '[SQL] data-jpa', value: 'data-jpa', hint: 'Hibernate ORM', category: 'sql' },
  { label: '[SQL] jdbc', value: 'jdbc', hint: 'Spring JDBC + HikariCP', category: 'sql' },
  { label: '[SQL] data-jdbc', value: 'data-jdbc', hint: 'Spring Data JDBC', category: 'sql' },
  { label: '[SQL] mybatis', value: 'mybatis', hint: 'MyBatis SQL mapper', category: 'sql' },
  { label: '[SQL] flyway', value: 'flyway', hint: 'Flyway migrations', category: 'sql' },
  { label: '[SQL] liquibase', value: 'liquibase', hint: 'Liquibase migrations', category: 'sql' },
  { label: '[SQL] h2', value: 'h2', hint: 'In-memory DB (dev)', category: 'sql' },
  { label: '[SQL] postgresql', value: 'postgresql', hint: 'PostgreSQL driver', category: 'sql' },
  { label: '[SQL] mysql', value: 'mysql', hint: 'MySQL driver', category: 'sql' },
  { label: '[SQL] mariadb', value: 'mariadb', hint: 'MariaDB driver', category: 'sql' },
  { label: '[SQL] mssql', value: 'mssql', hint: 'SQL Server driver', category: 'sql' },
  { label: '[NOSQL] data-mongodb', value: 'data-mongodb', hint: 'MongoDB', category: 'nosql' },
  { label: '[NOSQL] data-redis', value: 'data-redis', hint: 'Redis (Lettuce)', category: 'nosql' },
  { label: '[NOSQL] data-elasticsearch', value: 'data-elasticsearch', hint: 'Elasticsearch', category: 'nosql' },
  { label: '[SECURITY] security', value: 'security', hint: 'Spring Security', category: 'security' },
  { label: '[OPS] actuator', value: 'actuator', hint: 'Health, metrics', category: 'ops' },
  { label: '[TEST] testcontainers', value: 'testcontainers', hint: 'Testcontainers', category: 'test' },
];

export async function askDependencies(initialValues = []) {
  const depMode = await p.select({
    message: 'Dependency selection mode:',
    options: [
      { value: 'simple', label: 'Simple', hint: 'Quick select common deps' },
      { value: 'fzf', label: 'Detailed (FZF)', hint: 'Full searchable list with fuzzy search' },
      { value: 'none', label: 'None', hint: 'Skip dependencies' },
    ],
  });

  if (p.isCancel(depMode)) { p.cancel('Cancelled.'); process.exit(0); }

  if (depMode === 'simple') {
    const selected = await p.multiselect({
      message: 'Select common dependencies:',
      options: CONFIG.COMMON_DEPS,
      required: false,
      initialValues
    });
    return p.isCancel(selected) ? [] : (selected || []);
  }

  if (depMode === 'fzf') {
    console.log('\n  Opening FZF-style search...\n');
    await new Promise(r => setTimeout(r, 500));
    const deps = await fzfSearch(ALL_DEPS);
    console.log(`\n  Selected ${deps.length} dependencies`);
    await new Promise(r => setTimeout(r, 500));
    return deps;
  }

  return [];
}
