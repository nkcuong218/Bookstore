import { Box, Container, IconButton, InputBase, Typography, Badge, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'

const Header = () => {
  const theme = useTheme()

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>
      {/* Top message bar */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 0.5, fontSize: '0.8rem' }}>
        Free Shipping on Orders Over $40
      </Box>

      {/* Main Header Row */}
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
        {/* Logo */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer' }}>
          Bookstore.
        </Typography>

        {/* Search Bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          width: '50%',
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Search for books by keyword, title, author, or ISBN"
            inputProps={{ 'aria-label': 'search books' }}
          />
          <Box sx={{ bgcolor: 'primary.main', px: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <SearchIcon sx={{ color: 'white' }} />
          </Box>
        </Box>

        {/* Icons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton sx={{ color: 'text.primary' }}>
            <PersonOutlineOutlinedIcon />
            <Typography variant="body2">Account</Typography>
          </IconButton>
          <IconButton sx={{ color: 'text.primary' }}>
            <FavoriteBorderOutlinedIcon />
            <Typography variant="body2">Wishlist</Typography>
          </IconButton>
          <IconButton sx={{ color: 'text.primary' }}>
            <Badge badgeContent={0} color="secondary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>
        </Box>
      </Container>

      {/* Navigation Row */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', py: 1 }}>
        <Container maxWidth="xl" sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {['Books', 'eBooks', 'Audiobooks', 'Teens & YA', 'Kids', 'Toys & Games', 'Stationery & Gifts'].map((item) => (
            <Typography
              key={item}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {item}
            </Typography>
          ))}
        </Container>
      </Box>
    </Box>
  )
}

export default Header
