import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/csrf-token': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/view': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/add-member': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/add-task': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/mark-task-complete': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/edit-task':{
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, 
      },
      '/delete-task':{
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, 
      },
      '/edit-member':{
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, 
      },
      '/delete-member':{
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, 
      },
    }
  }
})
