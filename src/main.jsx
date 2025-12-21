import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// This is the file that actually "renders" Eilo into your HTML page 😭
// It finds the div with the id 'root' and injects Eilo's soul into it 💀
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

