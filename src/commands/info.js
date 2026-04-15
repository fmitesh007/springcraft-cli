import { loadProjectConfig, getRunCommand, getBuildCommand } from './run.js';
import { CONFIG } from '../shared/index.js';

export function handleInfo() {
  const config = loadProjectConfig();

  const runCmd = config.runCommand || getRunCommand(config.buildTool);
  const buildCmd = config.buildCommand || getBuildCommand(config.buildTool);

  const arch = config.arch === 'fullstack' ? 'fullstack (Monolithic)' : 'backend-only';
  const buildToolName = config.buildTool === 'maven-project' ? 'Maven' : 
                        config.buildTool === 'gradle-project-kotlin' ? 'Gradle Kotlin DSL' : 'Gradle';
  const langName = config.language?.charAt(0).toUpperCase() + config.language?.slice(1);
  const frontendDisplay = config.hasFrontend && config.frontendStack 
    ? `${config.frontendStack} (${config.frontendDir || 'frontend'})`
    : (config.hasFrontend ? (config.frontendDir || 'frontend') : 'none');

  const lines = [
    '',
    '╭─ Project Info ────────────────────────────────╮',
    `│ Name:         ${(config.name || 'unknown').padEnd(35)}│`,
    `│ Architecture: ${arch.padEnd(35)}│`,
    `│ Build Tool:   ${buildToolName.padEnd(35)}│`,
    `│ Language:     ${langName?.padEnd(35)}│`,
    `│ Java Version: ${(config.javaVersion || '17').padEnd(35)}│`,
    `│ Spring Boot:  ${(config.springBootVersion || '3.5.0').padEnd(35)}│`,
    `│ Frontend:     ${frontendDisplay.padEnd(35)}│`,
    '├─────────────────────────────────────────────────┤',
    `│  Backend:  http://localhost:${String(config.backendPort || CONFIG.BACKEND_PORT).padEnd(24)}│`,
    config.hasFrontend ? `│  Frontend: http://localhost:${String(config.frontendPort || CONFIG.FRONTEND_PORT).padEnd(23)}│` : '',
    '├─────────────────────────────────────────────────┤',
    `│ Run:       ${runCmd.substring(0, 35).padEnd(35)}│`,
    `│ Build:     ${buildCmd.substring(0, 35).padEnd(35)}│`,
    '╰─────────────────────────────────────────────────╯',
    ''
  ].filter(line => line !== '');

  console.log(lines.join('\n'));
}
