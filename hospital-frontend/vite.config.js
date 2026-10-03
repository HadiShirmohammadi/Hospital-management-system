import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Backend CORS only allows http://localhost:5173, so the port is pinned.
export default defineConfig({ plugins: [react()], server: { port: 5173, strictPort: true } })
