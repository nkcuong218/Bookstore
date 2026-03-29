import { Box } from '@mui/material'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Header from './components/Header/Header'
import HomePage from './pages/Home/HomePage'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ListBook from './pages/ListBook/ListBook'
import BookDetail from './pages/ListBook/BookDetail/BookDetail'
import Cart from './pages/Cart/Cart'
import WishList from './pages/WishList/WishList'

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<ListBook />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/wishlist" element={<WishList />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  )
}

export default App