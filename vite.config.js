import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This tells the engine to use the React plugin 💀
export default defineConfig({
  plugins: [react()],
})
