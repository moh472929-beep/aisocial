require('dotenv').config();
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const serverURL = pathToFileURL(path.join(__dirname, 'src', 'server.mjs')).href;
  await import(serverURL);
})();