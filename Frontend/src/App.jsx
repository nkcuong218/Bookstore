import { Box } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Header from './components/Header/Header'
import HomePage from './pages/Home/HomePage'
import Footer from './components/Footer/Footer'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ListBook from './pages/ListBook/ListBook'
import BookDetail from './pages/ListBook/BookDetail/BookDetail'
import Cart from './pages/Cart/Cart'
import WishList from './pages/WishList/WishList'
import Checkout from './pages/Order/Checkout'
import MyOrders from './pages/Order/MyOrders'
import OrderDetailUser from './pages/Order/OrderDetailUser'
import UserProfile from './pages/User/UserProfile'

// Admin
import AdminLayout from './pages/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import BooksManagement from './pages/Admin/BooksManagement'
import AddBook from './pages/Admin/AddBook'
import EditBook from './pages/Admin/EditBook'
import OrdersManagement from './pages/Admin/OrdersManagement'
import OrderDetail from './pages/Admin/OrderDetail'
import UsersManagement from './pages/Admin/UsersManagement'

// Protected Route Component
const ProtectedAdminRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const isAdmin = currentUser.role === 'admin'
  
  return isAdmin ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route path="/" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <HomePage />
            </Box>
            <Footer />
          </Box>
        } />
        
        <Route path="/books" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <ListBook />
            </Box>
            <Footer />
          </Box>
        } />
        
        <Route path="/books/:id" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <BookDetail />
            </Box>
            <Footer />
          </Box>
        } />
        
        <Route path="/cart" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Cart />
            </Box>
            <Footer />
          </Box>
        } />

        <Route path="/wishlist" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <WishList />
            </Box>
            <Footer />
          </Box>
        } />

        <Route path="/checkout" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Checkout />
            </Box>
            <Footer />
          </Box>
        } />

        <Route path="/my-orders" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <MyOrders />
            </Box>
            <Footer />
          </Box>
        } />

        <Route path="/my-orders/:id" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <OrderDetailUser />
            </Box>
            <Footer />
          </Box>
        } />

        <Route path="/profile" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <UserProfile />
            </Box>
            <Footer />
          </Box>
        } />
        
        <Route path="/login" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Login />
            </Box>
            <Footer />
          </Box>
        } />
        
        <Route path="/register" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Register />
            </Box>
            <Footer />
          </Box>
        } />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<BooksManagement />} />
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<EditBook />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="categories" element={
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <h2>Quản lý thể loại</h2>
              <p>Trang này đang được phát triển...</p>
            </Box>
          } />
        </Route>
      </Routes>
    </Router>
  )
}

export default App