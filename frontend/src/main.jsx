import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'

// Fetch CSRF token on app startup and set axios default header
axios.get('/csrf-token/', { withCredentials: true })
  .then(response => {
    axios.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token
  })
  .catch(err => console.error('Failed to fetch CSRF token:', err))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

