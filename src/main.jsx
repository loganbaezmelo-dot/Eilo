import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// This finds the "root" div in your index.html and drops Eilo inside 💀
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

