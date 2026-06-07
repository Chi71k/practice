import React from 'react'
import ReactDOM from 'react-dom/client'   // ← этого не хватает
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.scss'


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)