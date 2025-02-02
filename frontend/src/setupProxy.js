const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // ...existing code...
      },
      onError: (err, req, res) => {
        // ...existing code...
      }
    })
  );
};
