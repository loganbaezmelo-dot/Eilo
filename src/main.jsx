import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// This file boots up Eilo's body in the browser 😭
// It finds the 'root' div in index.html and drops Eilo's soul inside 💀
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

