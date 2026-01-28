import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import ProductPage from './ProductPage'
import ErrorPage from './ErrorPage'

const routing = (
  <Router>
    <div>
      <Routes>
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/" element={<App />} />
      </Routes>
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))
