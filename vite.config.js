import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
 plugins:[react(),tailwindcss()],
 build:{rollupOptions:{output:{manualChunks(id){
  if(!id.includes('node_modules'))return;
  // Keep Firebase entry points and shared internals together. Splitting the
  // wrappers from @firebase/* creates circular chunks and startup TDZ errors.
  if(id.includes('firebase'))return 'firebase';
  if(id.includes('framer-motion')||id.includes('motion-dom')||id.includes('motion-utils'))return 'motion';
 }}}}
});
