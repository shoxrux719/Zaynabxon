import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { handleLead } from './server/lead-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**'] } },
  plugins: [inspectAttr(), react(), {
    name: 'lead-api',
    configureServer(server) {
      server.middlewares.use('/api/lead', (req, res) => { void handleLead(req, res) })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/lead', (req, res) => { void handleLead(req, res) })
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
