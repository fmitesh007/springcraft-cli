import fs from 'fs';
import path from 'path';
import os from 'os';

const PRESETS_DIR = path.join(os.homedir(), '.create-spring-app');
const PRESETS_FILE = path.join(PRESETS_DIR, 'presets.json');

function ensureDir() {
  if (!fs.existsSync(PRESETS_DIR)) {
    fs.mkdirSync(PRESETS_DIR, { recursive: true });
  }
}

function loadAll() {
  ensureDir();
  if (!fs.existsSync(PRESETS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function loadPreset(name) {
  const presets = loadAll();
  return presets[name] || null;
}

export function savePreset(name, options) {
  ensureDir();
  const presets = loadAll();
  presets[name] = options;
  fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
}

export function listPresets() {
  const presets = loadAll();
  return Object.keys(presets);
}
