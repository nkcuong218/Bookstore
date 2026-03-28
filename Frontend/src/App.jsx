import { Box } from '@mui/material'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Header from './components/Header/Header'
import HomePage from './pages/Home/HomePage'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  )
}

export default App