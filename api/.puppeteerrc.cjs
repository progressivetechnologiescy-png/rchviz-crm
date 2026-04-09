const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a reliable path within the project directory
  // so Render doesn't lose it dynamically.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
