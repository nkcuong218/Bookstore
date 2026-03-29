import {
  Box, Container, IconButton, InputBase, Typography, Badge, Menu, MenuItem, Button
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { mockNavItems } from '../../apis/mock-data'

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  const open = Boolean(anchorEl)

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('currentUser')
    if (token && user) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setIsLoggedIn(false)
    setCurrentUser(null)
    handleClose()
    navigate('/')
  }

  const handleLogin = () => {
    handleClose()
    navigate('/login')
  }

  const handleRegister = () => {
    handleClose()
    navigate('/register')
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>

      {/* Top bar */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 0.5, fontSize: '0.8rem' }}>
        Free Shipping on Orders Over $40
      </Box>

      {/* Main Header */}
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>

        {/* Logo */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer' }}>
          Bookstore
        </Typography>

        {/* Search */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          width: '50%',
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search books..." />
          <Box sx={{ bgcolor: 'primary.main', px: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <SearchIcon sx={{ color: 'white' }} />
          </Box>
        </Box>

        {/* Icons */}
        <Box sx={{ display: 'flex', gap: 2 }}>

          {/* ACCOUNT */}
          <IconButton onClick={handleClick} sx={{ color: 'text.primary', flexDirection: 'column' }}>
            <PersonOutlineOutlinedIcon />
            <Typography variant="body2">
              {isLoggedIn ? currentUser?.username : 'Account'}
            </Typography>
          </IconButton>

          {/* Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            {isLoggedIn ? (
              <Box>
                <MenuItem disabled>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Xin chào, {currentUser?.username}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>Hồ sơ của tôi</MenuItem>
                <MenuItem onClick={handleClose}>Đơn hàng của tôi</MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Đăng xuất
                </MenuItem>
              </Box>
            ) : (
              <Box sx={{ p: 2, width: 250 }}>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                  Vui lòng đăng nhập
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  sx={{ mb: 1 }}
                >
                  Đăng nhập
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleRegister}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Menu>

          {/* Wishlist */}
          <IconButton sx={{ color: 'text.primary', flexDirection: 'column' }}>
            <FavoriteBorderOutlinedIcon />
            <Typography variant="body2">Wishlist</Typography>
          </IconButton>

          {/* Cart */}
          <IconButton sx={{ color: 'text.primary' }}>
            <Badge badgeContent={0} color="secondary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

        </Box>
      </Container>

      {/* Nav */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', py: 1 }}>
        <Container maxWidth="xl" sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {mockNavItems.map((item) => (
            <Typography key={item} sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
              {item}
            </Typography>
          ))}
        </Container>
      </Box>

    </Box>
  )
}

export default Header