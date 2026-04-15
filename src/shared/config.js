// Central configuration and constants

export const CONFIG = {
  SPRINGCRAFT_JSON: 'springcraft.json',
  SPRING_INITIALIZR_URL: 'https://start.spring.io/starter.zip',
  
  // Ports
  BACKEND_PORT: 8080,
  FRONTEND_PORT: 5173,
  
  // Vite proxy
  VITE_PROXY_PATH: '/api',
  VITE_PROXY_TARGET: 'http://localhost:8080',
  
  // Default values
  DEFAULTS: {
    language: 'java',
    springBootVersion: '3.5.0',
    javaVersion: '17',
    packaging: 'jar',
  },
  
  // Required fields for CLI mode
  REQUIRED_CLI_FIELDS: ['artifactId', 'buildTool', 'groupId', 'packageName'],
  
  // Spring Initializr options
  BUILD_TOOLS: ['maven-project', 'gradle-project', 'gradle-project-kotlin'],
  LANGUAGES: ['java', 'kotlin', 'groovy'],
  JAVA_VERSIONS: ['17', '21', '11', '24'],
  SPRING_BOOT_VERSIONS: ['3.5.0', '3.4.5', '3.3.11', '3.2.12'],
  PACKAGING_OPTIONS: ['jar', 'war'],
  
  // Frontend frameworks
  FRONTEND_FRAMEWORKS: ['react', 'vue', 'svelte', 'angular', 'preact', 'solid', 'lit', 'none'],
  
  // Database dependencies (for docker-compose)
  DB_DEPS: ['postgresql', 'mysql', 'mariadb', 'mssql', 'data-mongodb', 'data-redis', 'data-elasticsearch'],
  
  // DB port mappings
  DB_PORTS: {
    postgresql: 5432,
    mysql: 3306,
    mariadb: 3306,
    mssql: 1433,
    'data-mongodb': 27017,
    'data-redis': 6379,
    'data-elasticsearch': 9200,
  },
  
  // DB Docker images
  DB_IMAGES: {
    postgresql: 'postgres:16',
    mysql: 'mysql:8',
    mariadb: 'mariadb:11',
    mssql: 'mcr.microsoft.com/mssql/server:2022-latest',
    'data-mongodb': 'mongo:7',
    'data-redis': 'redis:7-alpine',
    'data-elasticsearch': 'elasticsearch:8.13.0',
  },
  
  // Common dependencies
  COMMON_DEPS: [
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
  ],
};

export function getRunCommand(buildTool) {
  return buildTool?.includes('gradle') ? './gradlew bootRun' : './mvnw spring-boot:run';
}

export function getBuildCommand(buildTool) {
  return buildTool?.includes('gradle') ? './gradlew build' : './mvnw clean package';
}

export function hasDbDep(dependencies) {
  return dependencies?.some(d => CONFIG.DB_DEPS.includes(d));
}

export function buildSpringInitializrUrl(options) {
  const {
    buildTool,
    language,
    javaVersion,
    springBootVersion,
    groupId,
    artifactId,
    packageName,
    description,
    packaging,
    dependencies,
  } = options;

  const params = new URLSearchParams({
    type: buildTool,
    language,
    javaVersion,
    bootVersion: springBootVersion,
    groupId,
    artifactId,
    name: artifactId,
    packageName,
    description,
    packaging,
    dependencies: dependencies.join(','),
  });

  return `${CONFIG.SPRING_INITIALIZR_URL}?${params.toString()}`;
}
