import * as p from '@clack/prompts';
import * as readline from 'readline';

const COMMON_DEPS = [
  { value: 'web', label: 'web', hint: 'REST APIs, MVC' },
  { value: 'data-jpa', label: 'data-jpa', hint: 'Hibernate ORM' },
  { value: 'security', label: 'security', hint: 'Spring Security' },
  { value: 'validation', label: 'validation', hint: 'Bean Validation' },
  { value: 'lombok', label: 'lombok', hint: 'Boilerplate reducer' },
  { value: 'devtools', label: 'devtools', hint: 'Hot reload' },
  { value: 'actuator', label: 'actuator', hint: 'Health & metrics' },
  { value: 'h2', label: 'h2', hint: 'In-memory DB (dev)' },
  { value: 'postgresql', label: 'postgresql', hint: 'PostgreSQL driver' },
  { value: 'thymeleaf', label: 'thymeleaf', hint: 'Server-side HTML' },
  { value: 'mail', label: 'mail', hint: 'JavaMail (SMTP)' },
  { value: 'cache', label: 'cache', hint: 'Spring Cache' },
];

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
  { label: '[TEMPLATE] thymeleaf', value: 'thymeleaf', hint: 'Server-side HTML', category: 'template' },
  { label: '[TEMPLATE] freemarker', value: 'freemarker', hint: 'FreeMarker templates', category: 'template' },
  { label: '[TEMPLATE] mustache', value: 'mustache', hint: 'Mustache templates', category: 'template' },
  { label: '[SECURITY] security', value: 'security', hint: 'Spring Security', category: 'security' },
  { label: '[SECURITY] oauth2-client', value: 'oauth2-client', hint: 'OAuth2 / OIDC login', category: 'security' },
  { label: '[SECURITY] oauth2-resource-server', value: 'oauth2-resource-server', hint: 'JWT / opaque token', category: 'security' },
  { label: '[SECURITY] oauth2-authorization-server', value: 'oauth2-authorization-server', hint: 'Auth server', category: 'security' },
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
  { label: '[SQL] oracle', value: 'oracle', hint: 'Oracle driver', category: 'sql' },
  { label: '[NOSQL] data-mongodb', value: 'data-mongodb', hint: 'MongoDB', category: 'nosql' },
  { label: '[NOSQL] data-redis', value: 'data-redis', hint: 'Redis (Lettuce)', category: 'nosql' },
  { label: '[NOSQL] data-elasticsearch', value: 'data-elasticsearch', hint: 'Elasticsearch', category: 'nosql' },
  { label: '[NOSQL] data-cassandra', value: 'data-cassandra', hint: 'Cassandra', category: 'nosql' },
  { label: '[NOSQL] data-neo4j', value: 'data-neo4j', hint: 'Neo4j graph DB', category: 'nosql' },
  { label: '[NOSQL] data-couchbase', value: 'data-couchbase', hint: 'Couchbase', category: 'nosql' },
  { label: '[MESSAGING] amqp', value: 'amqp', hint: 'RabbitMQ', category: 'messaging' },
  { label: '[MESSAGING] kafka', value: 'kafka', hint: 'Apache Kafka', category: 'messaging' },
  { label: '[MESSAGING] kafka-streams', value: 'kafka-streams', hint: 'Kafka Streams', category: 'messaging' },
  { label: '[MESSAGING] activemq', value: 'activemq', hint: 'ActiveMQ Classic', category: 'messaging' },
  { label: '[MESSAGING] artemis', value: 'artemis', hint: 'ActiveMQ Artemis', category: 'messaging' },
  { label: '[IO] batch', value: 'batch', hint: 'Spring Batch', category: 'io' },
  { label: '[IO] mail', value: 'mail', hint: 'JavaMail (SMTP)', category: 'io' },
  { label: '[IO] quartz', value: 'quartz', hint: 'Quartz Scheduler', category: 'io' },
  { label: '[IO] cache', value: 'cache', hint: 'Spring Cache', category: 'io' },
  { label: '[IO] validation', value: 'validation', hint: 'Bean Validation', category: 'io' },
  { label: '[IO] retry', value: 'retry', hint: 'Spring Retry', category: 'io' },
  { label: '[OPS] actuator', value: 'actuator', hint: 'Health, metrics', category: 'ops' },
  { label: '[OPS] prometheus', value: 'prometheus', hint: 'Micrometer Prometheus', category: 'ops' },
  { label: '[OPS] distributed-tracing', value: 'distributed-tracing', hint: 'Micrometer Tracing', category: 'ops' },
  { label: '[OPS] zipkin', value: 'zipkin', hint: 'Zipkin reporter', category: 'ops' },
  { label: '[TEST] testcontainers', value: 'testcontainers', hint: 'Testcontainers', category: 'test' },
  { label: '[TEST] restdocs', value: 'restdocs', hint: 'Spring REST Docs', category: 'test' },
  { label: '[CLOUD] cloud-config-client', value: 'cloud-config-client', hint: 'Config Client', category: 'cloud' },
  { label: '[CLOUD] cloud-eureka', value: 'cloud-eureka', hint: 'Eureka Client', category: 'cloud' },
  { label: '[CLOUD] cloud-gateway', value: 'cloud-gateway', hint: 'Cloud Gateway', category: 'cloud' },
  { label: '[CLOUD] resilience4j', value: 'resilience4j', hint: 'Circuit breaker', category: 'cloud' },
  { label: '[CLOUD] openfeign', value: 'openfeign', hint: 'Declarative HTTP', category: 'cloud' },
];

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
        if (item) { selected.has(item.value) ? selected.delete(item.value) : selected.add(item.value); cursor = Math.min(filtered.length - 1, cursor + 1); render(); }
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

const REQUIRED_FIELDS = ['buildTool', 'language', 'javaVersion', 'springBootVersion', 'groupId', 'artifactId', 'packageName', 'description', 'packaging'];

export async function askQuestions(projectName, flags = {}) {
  if (flags.buildTool && flags.language && flags.javaVersion && flags.springBootVersion && flags.groupId && flags.artifactId && flags.packageName && flags.description && flags.packaging) {
    p.log.info('Using CLI flags - skipping prompts.');
    return { ...flags, dependencies: flags.dependencies || [] };
  }

  p.intro('Create Spring Boot Project');

  const depMode = await p.select({
    message: 'Dependency selection mode:',
    options: [
      { value: 'simple', label: 'Simple', hint: 'Quick select common deps' },
      { value: 'fzf', label: 'Detailed (FZF)', hint: 'Full searchable list with fuzzy search' },
      { value: 'none', label: 'None', hint: 'Skip dependencies' },
    ],
  });

  if (p.isCancel(depMode)) { p.cancel('Cancelled.'); process.exit(0); }

  const answers = await p.group({
    buildTool: () => p.select({ message: 'Build tool:', options: [{ value: 'maven-project', label: 'Maven' }, { value: 'gradle-project', label: 'Gradle (Groovy DSL)' }, { value: 'gradle-project-kotlin', label: 'Gradle (Kotlin DSL)' }], initialValue: flags.buildTool }),
    language: () => p.select({ message: 'Language:', options: [{ value: 'java', label: 'Java' }, { value: 'kotlin', label: 'Kotlin' }, { value: 'groovy', label: 'Groovy' }], initialValue: flags.language }),
    springBootVersion: () => p.select({ message: 'Spring Boot version:', options: [{ value: '3.5.0', label: '3.5.0 (recommended)' }, { value: '3.4.5', label: '3.4.5' }, { value: '3.3.11', label: '3.3.11' }, { value: '3.2.12', label: '3.2.12' }], initialValue: flags.springBootVersion }),
    javaVersion: () => p.select({ message: 'Java version:', options: [{ value: '17', label: '17 (LTS, recommended)' }, { value: '21', label: '21 (LTS)' }, { value: '11', label: '11' }, { value: '24', label: '24 (latest)' }], initialValue: flags.javaVersion }),
    groupId: () => p.text({ message: 'Group ID:', placeholder: 'com.example', default: flags.groupId || 'com.example', validate: v => { if (!v?.trim()) return 'Required'; if (!/^[a-z][a-z0-9._]*$/i.test(v)) return 'Invalid format'; } }),
    artifactId: () => p.text({ message: 'Artifact ID:', placeholder: projectName, default: flags.artifactId || projectName, validate: v => { if (!v?.trim()) return 'Required'; if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(v)) return 'Invalid format'; } }),
    packageName: ({ results }) => { const g = results.groupId || flags.groupId || 'com.example'; const a = results.artifactId || flags.artifactId || projectName; const def = g + '.' + a.replace(/[^a-zA-Z0-9]/g, ''); return p.text({ message: 'Package name:', placeholder: def, default: flags.packageName || def, validate: v => { if (!v?.trim()) return 'Required'; if (!/^[a-z][a-zA-Z0-9._]*$/.test(v)) return 'Invalid'; } }); },
    description: () => p.text({ message: 'Description:', placeholder: 'A brief description', default: flags.description || 'Demo project for Spring Boot' }),
    packaging: () => p.select({ message: 'Packaging:', options: [{ value: 'jar', label: 'Jar (recommended)' }, { value: 'war', label: 'War' }], initialValue: flags.packaging }),
  }, { onCancel: () => { p.cancel('Cancelled.'); process.exit(0); } });

  let dependencies = [];
  if (depMode === 'simple') {
    const selected = await p.multiselect({ message: 'Select common dependencies:', options: COMMON_DEPS, required: false, initialValues: flags.dependencies || [] });
    if (!p.isCancel(selected)) dependencies = selected || [];
  } else if (depMode === 'fzf') {
    console.log('\n  Opening FZF-style search...\n');
    await new Promise(r => setTimeout(r, 500));
    dependencies = await fzfSearch(ALL_DEPS);
    console.log(`\n  Selected ${dependencies.length} dependencies`);
    await new Promise(r => setTimeout(r, 500));
  }

  return { ...answers, dependencies };
}
