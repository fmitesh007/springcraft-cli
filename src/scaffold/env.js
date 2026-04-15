import * as p from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';

const ENV_TEMPLATES = {
  postgresql: {
    lines: ['SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/dbname', 'DB_USER=postgres', 'DB_PASS=secret'],
    example: ['SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS='],
  },
  mysql: {
    lines: ['SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/dbname', 'DB_USER=root', 'DB_PASS=secret'],
    example: ['SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS='],
  },
  mariadb: {
    lines: ['SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3306/dbname', 'DB_USER=root', 'DB_PASS=secret'],
    example: ['SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS='],
  },
  'h2-jdbc': {
    lines: ['SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb', 'DB_USER=sa', 'DB_PASS='],
    example: ['SPRING_DATASOURCE_URL=', 'DB_USER=', 'DB_PASS='],
  },
  redis: {
    lines: ['REDIS_HOST=localhost', 'REDIS_PORT=6379'],
    example: ['REDIS_HOST=', 'REDIS_PORT='],
  },
  security: {
    lines: ['JWT_SECRET=changeme_use_a_long_random_string', 'JWT_EXPIRATION=86400000'],
    example: ['JWT_SECRET=', 'JWT_EXPIRATION='],
  },
  mail: {
    lines: ['MAIL_HOST=smtp.gmail.com', 'MAIL_PORT=587', 'MAIL_USER=', 'MAIL_PASS='],
    example: ['MAIL_HOST=', 'MAIL_PORT=', 'MAIL_USER=', 'MAIL_PASS='],
  },
  kafka: {
    lines: ['KAFKA_BOOTSTRAP_SERVERS=localhost:9092'],
    example: ['KAFKA_BOOTSTRAP_SERVERS='],
  },
  amqp: {
    lines: ['RABBITMQ_HOST=localhost', 'RABBITMQ_PORT=5672', 'RABBITMQ_USER=guest', 'RABBITMQ_PASS=guest'],
    example: ['RABBITMQ_HOST=', 'RABBITMQ_PORT=', 'RABBITMQ_USER=', 'RABBITMQ_PASS='],
  },
};

export async function generateEnvFiles(projectDir, answers) {
  const deps = answers.dependencies || [];
  const lines = [];
  const exampleLines = [];

  if (deps.includes('postgresql')) {
    lines.push(...ENV_TEMPLATES.postgresql.lines);
    exampleLines.push(...ENV_TEMPLATES.postgresql.example);
  } else if (deps.includes('mysql')) {
    lines.push(...ENV_TEMPLATES.mysql.lines);
    exampleLines.push(...ENV_TEMPLATES.mysql.example);
  } else if (deps.includes('mariadb')) {
    lines.push(...ENV_TEMPLATES.mariadb.lines);
    exampleLines.push(...ENV_TEMPLATES.mariadb.example);
  } else if (deps.includes('data-jpa') || deps.includes('jdbc')) {
    lines.push(...ENV_TEMPLATES['h2-jdbc'].lines);
    exampleLines.push(...ENV_TEMPLATES['h2-jdbc'].example);
  }

  if (deps.includes('data-redis')) {
    lines.push(...ENV_TEMPLATES.redis.lines);
    exampleLines.push(...ENV_TEMPLATES.redis.example);
  }
  if (deps.includes('security')) {
    lines.push(...ENV_TEMPLATES.security.lines);
    exampleLines.push(...ENV_TEMPLATES.security.example);
  }
  if (deps.includes('mail')) {
    lines.push(...ENV_TEMPLATES.mail.lines);
    exampleLines.push(...ENV_TEMPLATES.mail.example);
  }
  if (deps.includes('kafka')) {
    lines.push(...ENV_TEMPLATES.kafka.lines);
    exampleLines.push(...ENV_TEMPLATES.kafka.example);
  }
  if (deps.includes('amqp')) {
    lines.push(...ENV_TEMPLATES.amqp.lines);
    exampleLines.push(...ENV_TEMPLATES.amqp.example);
  }

  if (lines.length > 0) {
    await fs.outputFile(path.join(projectDir, '.env'), lines.join('\n') + '\n');
    await fs.outputFile(path.join(projectDir, '.env.example'), exampleLines.join('\n') + '\n');
    p.log.success('.env and .env.example generated.');
  }
}
