import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import LobbyPage from './pages/LobbyPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:streamerCode" element={<SearchPage />} />
        <Route path="/lobby/:streamerCode" element={<LobbyPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
