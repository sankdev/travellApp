const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: {
    '.js': 'jsx',
  },
}).catch(() => process.exit(1));