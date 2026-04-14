import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, AppBar, IconButton, Avatar, Menu, MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import authService from '../../apis/authService'

const drawerWidth = 260

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser('admin') || {})

  useEffect(() => {
    const refreshAdminUser = () => {
      setCurrentUser(authService.getCurrentUser('admin') || {})
    }

    window.addEventListener('auth-changed', refreshAdminUser)
    window.addEventListener('storage', refreshAdminUser)

    return () => {
      window.removeEventListener('auth-changed', refreshAdminUser)
      window.removeEventListener('storage', refreshAdminUser)
    }
  }, [])

  const menuItems = [
    { text: 'Tổng quan', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Quản lý sách', icon: <MenuBookIcon />, path: '/admin/books' },
    { text: 'Quản lý đơn hàng', icon: <ShoppingCartIcon />, path: '/admin/orders' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Mã giảm giá', icon: <LocalOfferIcon />, path: '/admin/discount-codes' },
    { text: 'Quản lý giao diện', icon: <DashboardCustomizeIcon />, path: '/admin/banners' }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    authService.logout('admin')
    navigate('/admin/login')
  }

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Bảng quản trị
        </Typography>
      </Toolbar>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Quản trị hệ thống
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {currentUser.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Typography variant="body1">{currentUser.username || 'Admin'}</Typography>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default AdminLayout
