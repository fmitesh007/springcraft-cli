#!/usr/bin/env node

import { cli } from '../src/cli/index.js';

cli().catch(err => {
  console.error(err);
  process.exit(1);
});
