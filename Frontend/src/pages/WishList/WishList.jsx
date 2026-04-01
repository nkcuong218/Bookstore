import {
  Box, Container, Typography, Grid, Button, Paper,
  Divider, Breadcrumbs, Link, Chip, Snackbar, Alert
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { formatPrice } from '../../utils/formatPrice'
import authService from '../../apis/authService'
import wishlistService from '../../apis/wishlistService'

const WishList = () => {
  const navigate = useNavigate()

  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const mapWishlistItems = (items) => {
    return (items || []).map((item) => ({
      ...item.book,
      wishlistItemId: item.id,
      addedDate: item.addedAt ? new Date(item.addedAt).toLocaleDateString('vi-VN') : ''
    }))
  }

  const loadWishlist = async () => {
    if (!authService.isAuthenticated('customer')) {
      setWishlistItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await wishlistService.getMyWishlist()
      setWishlistItems(mapWishlistItems(response))
    } catch (error) {
      showSnackbar(error.message || 'Không tải được danh sách yêu thích', 'error')
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()

    const handleWishlistUpdate = () => {
      loadWishlist()
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    window.addEventListener('auth-changed', handleWishlistUpdate)

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate)
      window.removeEventListener('auth-changed', handleWishlistUpdate)
    }
  }, [])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleRemove = async (bookId) => {
    try {
      await wishlistService.removeFromWishlist(bookId)
      setWishlistItems(prev => prev.filter(item => item.id !== bookId))
      showSnackbar('Đã xóa khỏi danh sách yêu thích', 'info')
    } catch (error) {
      showSnackbar(error.message || 'Xóa khỏi wishlist thất bại', 'error')
    }
  }

  const handleAddToCart = (book) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const foundItem = existingCart.find((item) => item.id === book.id)

    let nextCart
    if (foundItem) {
      nextCart = existingCart.map((item) =>
        item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      nextCart = [
        ...existingCart,
        {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          coverUrl: book.coverUrl,
          quantity: 1
        }
      ]
    }

    localStorage.setItem('cart', JSON.stringify(nextCart))
    window.dispatchEvent(new Event('cart-updated'))
    showSnackbar(`Đã thêm "${book.title}" vào giỏ hàng!`, 'success')
  }

  const handleMoveAllToCart = () => {
    if (wishlistItems.length === 0) return

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    let nextCart = [...existingCart]

    wishlistItems.forEach((book) => {
      const foundItem = nextCart.find((item) => item.id === book.id)

      if (foundItem) {
        nextCart = nextCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        nextCart.push({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          coverUrl: book.coverUrl,
          quantity: 1
        })
      }
    })

    localStorage.setItem('cart', JSON.stringify(nextCart))
    window.dispatchEvent(new Event('cart-updated'))
    showSnackbar(`Đã thêm ${wishlistItems.length} sách vào giỏ hàng!`, 'success')
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Đang tải danh sách yêu thích...
            </Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  if (!authService.isAuthenticated('customer')) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <FavoriteBorderIcon sx={{ fontSize: 100, color: '#e0e0e0' }} />
            <Typography variant="h4" sx={{ color: 'text.secondary' }}>
              Bạn chưa đăng nhập
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Đăng nhập để xem danh sách yêu thích của bạn.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ px: 4, mt: 1 }}
            >
              Đăng nhập
            </Button>
          </Box>
        </Container>
      </Box>
    )
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <FavoriteBorderIcon sx={{ fontSize: 100, color: '#e0e0e0' }} />
            <Typography variant="h4" sx={{ color: 'text.secondary' }}>
              Danh sách yêu thích trống
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hãy thêm những cuốn sách bạn yêu thích vào đây!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/books')}
              sx={{ px: 4, mt: 1 }}
            >
              Khám phá sách ngay
            </Button>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Trang chủ
          </Link>
          <Typography color="text.primary">Yêu thích</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Yêu thích của tôi
            </Typography>
            <Chip
              label={`${wishlistItems.length} cuốn sách`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartOutlinedIcon />}
            onClick={handleMoveAllToCart}
            sx={{ px: 3 }}
          >
            Thêm tất cả vào giỏ
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Wishlist Items */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              {wishlistItems.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    {/* Ảnh bìa sách */}
                    <Box
                      onClick={() => navigate(`/books/${item.id}`)}
                      sx={{
                        bgcolor: '#f0f0f0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        aspectRatio: '2/3',
                        width: 60,
                        flexShrink: 0,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    {/* Thông tin sách */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          mb: 0.5,
                          cursor: 'pointer',
                          fontFamily: '"Georgia", serif',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => navigate(`/books/${item.id}`)}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item.author}
                      </Typography>
                      {item.genres && item.genres.length > 0 && (
                        <Chip label={item.genres[0]} size="small" variant="outlined" sx={{ mb: 1, fontSize: '0.7rem' }} />
                      )}
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đã thêm ngày {item.addedDate}
                      </Typography>
                    </Box>

                    {/* Nút thao tác — dính sát lề phải */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartOutlinedIcon />}
                        onClick={() => handleAddToCart(item)}
                        sx={{ px: 2, py: 1, fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        Thêm vào giỏ
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleRemove(item.id)}
                        sx={{ px: 2, py: 1, fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        Xóa
                      </Button>
                    </Box>

                  </Box>

                  {index < wishlistItems.length - 1 && <Divider sx={{ my: 3 }} />}
                </Box>
              ))}

              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/books')}
                >
                  Tiếp tục khám phá sách
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default WishList
