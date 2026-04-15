export class ScaffolderError extends Error {
  constructor(message, code = 'UNKNOWN', recoverable = false) {
    super(message);
    this.name = 'ScaffolderError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

export const ERROR_CODES = {
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  EXTRACT_FAILED: 'EXTRACT_FAILED',
  FRONTEND_SCAFFOLD_FAILED: 'FRONTEND_SCAFFOLD_FAILED',
  CONFIG_WRITE_FAILED: 'CONFIG_WRITE_FAILED',
  GIT_INIT_FAILED: 'GIT_INIT_FAILED',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  INVALID_PROJECT_DIR: 'INVALID_PROJECT_DIR',
};

export function handleError(error, context = '') {
  const prefix = context ? `[${context}] ` : '';
  
  if (error instanceof ScaffolderError) {
    console.error(`\n  ${prefix}${error.message}`);
    if (!error.recoverable) {
      process.exit(1);
    }
  } else {
    console.error(`\n  ${prefix}${error.message || 'An unexpected error occurred'}`);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

export function wrapAsync(fn, context = '') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
    }
  };
}
