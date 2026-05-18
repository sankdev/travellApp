//import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';

//export default defineConfig(({ mode }) => ({
//  plugins: [react()],
 // server: {
   // port: 3000,
   // allowedHosts: ['agencesvoyage.com'],
    //hmr: mode === 'development' // Désactive WebSocket en production
  //},
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,          // Vite écoutera sur ce port en production
    strictPort: true,    // Empêche de changer de port si 3000 est occupé
    host: '0.0.0.0',     // Permet l'accès depuis d'autres machines
    cors: true,          // Active CORS pour éviter les restrictions
    allowedHosts: ['agencesvoyage.com', 'www.agencesvoyage.com'],  // Limite l'accès aux hôtes autorisés
    // Désactive HMR proprement en production
    hmr: mode === 'development' ? { overlay: false } : false,

    // Configuration de proxy pour gérer les requêtes vers le backend
    proxy: {
      '/api': {
        target: 'https://agencesvoyage.com',  // Remplace avec ton domaine de backend
        changeOrigin: true,                   // Change l'origine pour le backend
        secure: false,                        // Si le backend utilise HTTP, sinon met à true pour HTTPS
        rewrite: (path) => path.replace(/^\/api/, '/api'), // NE PAS supprimer /api
      },
    },
  },
  build: {
    // Optimisations pour la production
    outDir: 'dist', // Dossier de sortie pour le build
    assetsDir: 'assets',  // Dossier des assets générés
    sourcemap: mode === 'development', // Génère les sourcemaps uniquement en développement
    minify: 'esbuild',   // Utilise esbuild pour minifier le code en production
  },
  base: '/',  // Assure que les ressources sont correctement liées lors du déploiement
}));
