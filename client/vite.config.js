import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy :{
      '/user': 'https://mern-chat-five.vercel.app',
      '/': 'https://mern-chat-five.vercel.app'
    }
  },
  plugins: [react()],
})
