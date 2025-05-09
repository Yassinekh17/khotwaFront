const PROXY_CONFIG = [
  {
    context: ['/api', '/users', '/ws'],
    target: 'http://localhost:8089',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
    ws: true
  }
];

module.exports = PROXY_CONFIG;
