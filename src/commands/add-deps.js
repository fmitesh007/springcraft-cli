import * as p from '@clack/prompts';
import * as readline from 'readline';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../shared/index.js';

// FZF-style search component (reused from dependencies.js)
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
      if (str && str.length === 1 && !key.ctrl && !key.meta) { query += str; cursor = 0; render(); return; }
    };

    function cleanup() {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      rl.close();
    }

    process.stdin.on('keypress', handleKeypress);
  });
}

// Read pom.xml and find groupId/artifactId
function readPomInfo(pomPath) {
  const content = fs.readFileSync(pomPath, 'utf-8');
  
  const groupIdMatch = content.match(/<groupId>([^<]+)<\/groupId>/);
  const artifactIdMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
  
  return {
    groupId: groupIdMatch ? groupIdMatch[1] : 'com.example',
    artifactId: artifactIdMatch ? artifactIdMatch[1] : 'app',
  };
}

// Add dependency to pom.xml
function addDependencyToPom(pomPath, dep) {
  const content = fs.readFileSync(pomPath, 'utf-8');
  
  // Check if dependency already exists
  if (content.includes(`<artifactId>${dep.value}</artifactId>`)) {
    return false;
  }
  
  // Find the </dependencies> tag and insert before it
  const newDep = `
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>${dep.value}</artifactId>
      <version>${dep.version || '${spring-boot.version}'}</version>
    </dependency>`;
  
  const newContent = content.replace(/(\s*<\/dependencies>)/, `${newDep}$1`);
  fs.writeFileSync(pomPath, newContent);
  return true;
}

export async function handleAddDeps() {
  p.intro('Add Dependencies to Project');
  
  // Check if in a project directory with pom.xml
  const cwd = process.cwd();
  const pomPath = path.join(cwd, 'pom.xml');
  const buildGradlePath = path.join(cwd, 'build.gradle');
  
  let isMaven = fs.existsSync(pomPath);
  let isGradle = fs.existsSync(buildGradlePath);
  
  if (!isMaven && !isGradle) {
    p.log.error('Not in a Spring Boot project directory (pom.xml or build.gradle not found).');
    p.log.info('Run this command from your project directory.');
    process.exit(1);
  }
  
  // Ask for source selection
  const source = await p.select({
    message: 'Dependency source:',
    options: [
      { value: 'spring-io', label: 'Spring Initializr (spring.io)', hint: 'Official Spring Boot starters' },
      { value: 'maven-repo', label: 'Maven Central Repository', hint: 'All Maven artifacts' },
    ],
  });
  
  if (p.isCancel(source)) { p.cancel('Cancelled.'); process.exit(0); }
  
  // Use existing FZF search with ALL_DEPS
  if (source === 'spring-io') {
    // Reuse the ALL_DEPS from dependencies.js
    const ALL_DEPS = [
      { label: '[DEVTOOLS] devtools', value: 'spring-boot-devtools', hint: 'Hot reload', category: 'devtools' },
      { label: '[DEVTOOLS] lombok', value: 'lombok', hint: 'Boilerplate reducer', category: 'devtools' },
      { label: '[DEVTOOLS] docker-compose', value: 'docker-compose-spring-boot-starter', hint: 'Docker Compose support', category: 'devtools' },
      { label: '[DEVTOOLS] spring-shell', value: 'spring-shell-starter', hint: 'Interactive CLI apps', category: 'devtools' },
      { label: '[DEVTOOLS] configuration-processor', value: 'spring-boot-configuration-processor', hint: 'Metadata for @ConfigurationProperties', category: 'devtools' },
      { label: '[WEB] web', value: 'spring-boot-starter-web', hint: 'Spring MVC, REST, Tomcat', category: 'web' },
      { label: '[WEB] webflux', value: 'spring-boot-starter-webflux', hint: 'Reactive web with Netty', category: 'web' },
      { label: '[WEB] graphql', value: 'spring-boot-starter-graphQL', hint: 'Spring for GraphQL', category: 'web' },
      { label: '[WEB] websocket', value: 'spring-boot-starter-websocket', hint: 'WebSocket support', category: 'web' },
      { label: '[WEB] jersey', value: 'jersey-starter', hint: 'JAX-RS with Jersey', category: 'web' },
      { label: '[WEB] hateoas', value: 'spring-boot-starter-hateoas', hint: 'Hypermedia REST (HAL)', category: 'web' },
      { label: '[SQL] data-jpa', value: 'spring-boot-starter-data-jpa', hint: 'Hibernate ORM', category: 'sql' },
      { label: '[SQL] jdbc', value: 'spring-boot-starter-jdbc', hint: 'Spring JDBC + HikariCP', category: 'sql' },
      { label: '[SQL] data-jdbc', value: 'spring-boot-starter-data-jdbc', hint: 'Spring Data JDBC', category: 'sql' },
      { label: '[SQL] mybatis', value: 'mybatis-spring-boot-starter', hint: 'MyBatis SQL mapper', category: 'sql' },
      { label: '[SQL] flyway', value: 'flyway-core', hint: 'Flyway migrations', category: 'sql' },
      { label: '[SQL] liquibase', value: 'liquibase-core', hint: 'Liquibase migrations', category: 'sql' },
      { label: '[SQL] h2', value: 'h2', hint: 'In-memory DB (dev)', category: 'sql' },
      { label: '[SQL] postgresql', value: 'postgresql', hint: 'PostgreSQL driver', category: 'sql' },
      { label: '[SQL] mysql', value: 'mysql-connector-j', hint: 'MySQL driver', category: 'sql' },
      { label: '[SQL] mariadb', value: 'mariadb-java-client', hint: 'MariaDB driver', category: 'sql' },
      { label: '[SQL] mssql', value: 'mssql-jdbc', hint: 'SQL Server driver', category: 'sql' },
      { label: '[NOSQL] data-mongodb', value: 'spring-boot-starter-data-mongodb', hint: 'MongoDB', category: 'nosql' },
      { label: '[NOSQL] data-redis', value: 'spring-boot-starter-data-redis', hint: 'Redis (Lettuce)', category: 'nosql' },
      { label: '[NOSQL] data-elasticsearch', value: 'spring-boot-starter-data-elasticsearch', hint: 'Elasticsearch', category: 'nosql' },
      { label: '[SECURITY] security', value: 'spring-boot-starter-security', hint: 'Spring Security', category: 'security' },
      { label: '[OPS] actuator', value: 'spring-boot-starter-actuator', hint: 'Health, metrics', category: 'ops' },
      { label: '[TEST] testcontainers', value: 'testcontainers', hint: 'Testcontainers', category: 'test' },
      { label: '[TEST] spring-boot-starter-test', value: 'spring-boot-starter-test', hint: 'Testing with JUnit', category: 'test' },
      { label: '[VALIDATION] validation', value: 'spring-boot-starter-validation', hint: 'Bean Validation', category: 'validation' },
      { label: '[THYMELEAF] thymeleaf', value: 'spring-boot-starter-thymeleaf', hint: 'Server-side HTML', category: 'thymeleaf' },
      { label: '[MAIL] mail', value: 'spring-boot-starter-mail', hint: 'JavaMail (SMTP)', category: 'mail' },
      { label: '[CACHE] cache', value: 'spring-boot-starter-cache', hint: 'Spring Cache', category: 'cache' },
      { label: '[AOP] aop', value: 'spring-boot-starter-aop', hint: 'Aspect Oriented Programming', category: 'aop' },
    ];
    
    console.log('\n  Opening FZF-style search for Spring Boot starters...\n');
    await new Promise(r => setTimeout(r, 500));
    
    const selected = await fzfSearch(ALL_DEPS);
    
    if (!selected || selected.length === 0) {
      p.log.info('No dependencies selected.');
      process.exit(0);
    }
    
    // Add each selected dependency to pom.xml
    if (isMaven) {
      let added = 0;
      for (const depId of selected) {
        const dep = ALL_DEPS.find(d => d.value === depId);
        if (dep) {
          if (addDependencyToPom(pomPath, dep)) {
            added++;
            p.log.success(`Added: ${dep.label}`);
          } else {
            p.log.warn(`Already exists: ${dep.label}`);
          }
        }
      }
      p.log.success(`\nAdded ${added} dependency(ies) to pom.xml`);
    } else if (isGradle) {
      p.log.warn('Gradle support - please add manually:');
      console.log('\n  dependencies {');
      for (const depId of selected) {
        const dep = ALL_DEPS.find(d => d.value === depId);
        if (dep) {
          console.log(`    implementation("org.springframework.boot:${dep.value}")`);
        }
      }
      console.log('  }');
    }
    
  } else if (source === 'maven-repo') {
    // For Maven Central, we need to fetch from web - prompt for artifact coordinates
    const coordinates = await p.text({
      message: 'Maven coordinates (groupId:artifactId:version):',
      placeholder: 'org.example:my-library:1.0.0',
      validate: v => {
        if (!v?.trim()) return 'Required';
        if (!/^[a-zA-Z][a-zA-Z0-9._-]*:[a-zA-Z][a-zA-Z0-9._-]*:[a-zA-Z0-9._-]+$/.test(v)) {
          return 'Use format groupId:artifactId:version';
        }
      },
    });
    
    if (p.isCancel(coordinates)) { p.cancel('Cancelled.'); process.exit(0); }
    
    const [groupId, artifactId, version] = coordinates.trim().split(':');
    
    if (isMaven) {
      // Add custom dependency to pom.xml
      const content = fs.readFileSync(pomPath, 'utf-8');
      
      // Check if already exists
      if (content.includes(`<artifactId>${artifactId}</artifactId>`)) {
        p.log.warn(`Dependency already exists: ${coordinates}`);
        process.exit(0);
      }
      
      const newDep = `
    <dependency>
      <groupId>${groupId}</groupId>
      <artifactId>${artifactId}</artifactId>
      <version>${version}</version>
    </dependency>`;
      
      const newContent = content.replace(/(\s*<\/dependencies>)/, `${newDep}$1`);
      fs.writeFileSync(pomPath, newContent);
      p.log.success(`Added: ${groupId}:${artifactId}:${version}`);
    } else if (isGradle) {
      p.log.warn('Gradle support - please add manually:');
      console.log(`\n  implementation("${groupId}:${artifactId}:${version}")`);
    }
  }
  
  p.outro('\nDone! Run `mvnw` or reload project in IDE to resolve dependencies.');
}