import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import authService from '../../apis/authService'
import wishlistService from '../../apis/wishlistService'

const BookCard = ({ id, title, author, price, coverUrl }) => {
  const navigate = useNavigate()

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const foundItem = existingCart.find((item) => item.id === id)

    let nextCart
    if (foundItem) {
      nextCart = existingCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      nextCart = [
        ...existingCart,
        { id, title, author, price, coverUrl, quantity: 1 }
      ]
    }

    localStorage.setItem('cart', JSON.stringify(nextCart))
    window.dispatchEvent(new Event('cart-updated'))
    alert('Đã thêm sách vào giỏ hàng!')
  }

  const handleCardClick = () => {
    navigate(`/books/${id}`)
  }

  const handleAddToWishlist = async () => {
    if (!authService.isAuthenticated('customer')) {
      alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích!')
      navigate('/login')
      return
    }

    try {
      await wishlistService.addToWishlist(id)
      alert('Đã thêm vào danh sách yêu thích!')
    } catch (error) {
      alert(error.message || 'Không thể thêm vào wishlist')
    }
  }

  return (
    <Card sx={{
      maxWidth: 220,
      boxShadow: 'none',
      border: 'none',
      backgroundColor: 'transparent',
      transition: 'transform 0.2s',
      position: 'relative',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)'
      },
      '&:hover .quick-add-btn': {
        opacity: 1
      }
    }}>
      <Box
        onClick={handleCardClick}
        sx={{ position: 'relative', overflow: 'hidden', mb: 1, borderRadius: '4px', bgcolor: '#f0f0f0', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {coverUrl ? (
          <CardMedia
            component="img"
            image={coverUrl}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Không có ảnh</Typography>
        )}
        {/* Container ẩn hiện khi hover — chứa 2 nút xếp dọc */}
        <Box
          className="quick-add-btn"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            px: 1,
            pb: 1,
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
            sx={{ boxShadow: 2, fontSize: '0.75rem', py: 0.6 }}
          >
            Thêm vào giỏ hàng
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToWishlist()
            }}
            sx={{ boxShadow: 2, fontSize: '0.75rem', py: 0.6 }}
          >
            Thêm vào wishlist
          </Button>
        </Box>
      </Box>
      <CardContent
        onClick={handleCardClick}
        sx={{ p: '0 !important', textAlign: 'center' }}
      >
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, lineHeight: 1.25, minHeight: '2.5em', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {author}
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold' }}>
          {typeof price === 'number' ? formatPrice(price) : price}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default BookCard
