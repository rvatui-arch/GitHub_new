/**
 * Logger Utility
 * Centralized logging system
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage, data);

    fs.appendFileSync(
      path.join(logDir, 'app.log'),
      `${logMessage} ${JSON.stringify(data)}\n`
    );
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(logMessage, error);

    fs.appendFileSync(
      path.join(logDir, 'error.log'),
      `${logMessage} ${JSON.stringify(error)}\n`
    );
  },

  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    console.warn(logMessage, data);

    fs.appendFileSync(
      path.join(logDir, 'app.log'),
      `${logMessage} ${JSON.stringify(data)}\n`
    );
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}`;
      console.log(logMessage, data);
    }
  },
};

module.exports = logger;
