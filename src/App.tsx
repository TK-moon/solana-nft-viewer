import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'

import Landing from './pages/Landing'
import NftListPage from './pages/NftListPage'

const App = () => (
  <div className='App'>
    <Routes>
      <Route
        path='/'
        element={<Landing />}
      />
      <Route
        path='/:walletid'
        element={<NftListPage />}
      />
    </Routes>
  </div>
)

export default App
