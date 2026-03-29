import { useState } from 'react'
import {
  Box, Container, Typography, Grid, IconButton,
  Card, CardMedia, CardContent, Button, Divider,
  Breadcrumbs, Link, Chip, Tooltip, Snackbar, Alert
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { mockBooks } from '../../apis/mock-data-vn'

const WishlistPage = () => {
  // Khởi tạo wishlist với 3 cuốn sách mẫu đầu tiên
  const [wishlistItems, setWishlistItems] = useState(
    mockBooks.slice(0, 3).map(book => ({ ...book, addedDate: new Date().toLocaleDateString('vi-VN') }))
  )
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleRemove = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id))
    setSnackbar({ open: true, message: 'Đã xóa khỏi Wishlist', severity: 'info' })
  }

  const handleAddToCart = (book) => {
    setSnackbar({ open: true, message: `Đã thêm "${book.title}" vào giỏ hàng!`, severity: 'success' })
  }

  const handleMoveAllToCart = () => {
    setSnackbar({ open: true, message: `Đã thêm ${wishlistItems.length} sách vào giỏ hàng!`, severity: 'success' })
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setSnackbar({ open: true, message: 'Đã sao chép link Wishlist!', severity: 'success' })
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" underline="hover" color="inherit" sx={{ fontSize: '0.9rem' }}>
            Trang chủ
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.9rem' }}>Wishlist</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" color="primary.main">
              Wishlist của tôi
            </Typography>
            <Chip
              label={`${wishlistItems.length} cuốn sách`}
              size="small"
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Chia sẻ Wishlist">
              <IconButton onClick={handleShare} sx={{ color: 'text.secondary' }}>
                <ShareOutlinedIcon />
              </IconButton>
            </Tooltip>
            {wishlistItems.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartOutlinedIcon />}
                onClick={handleMoveAllToCart}
                sx={{ px: 3 }}
              >
                Thêm tất cả vào giỏ
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <FavoriteBorderIcon sx={{ fontSize: '5rem', color: '#e0e0e0' }} />
            <Typography variant="h5" color="text.secondary">
              Wishlist của bạn đang trống
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hãy khám phá và thêm những cuốn sách bạn yêu thích vào đây!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/"
              size="large"
              sx={{ px: 4, py: 1.5, mt: 1 }}
            >
              Khám phá ngay
            </Button>
          </Box>
        ) : (
          <>
            {/* Column Headers */}
            <Box sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: '120px 1fr 120px 160px 60px',
              gap: 2, px: 2, mb: 2
            }}>
              <Box />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>THÔNG TIN SÁCH</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} textAlign="center">GIÁ</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} textAlign="center">THAO TÁC</Typography>
              <Box />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Wishlist Items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {wishlistItems.map((book) => (
                <Card
                  key={book.id}
                  sx={{
                    display: { xs: 'flex', md: 'grid' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gridTemplateColumns: { md: '120px 1fr 120px 160px 60px' },
                    gap: 2,
                    alignItems: 'center',
                    p: 2,
                    boxShadow: 1,
                    borderRadius: 2,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  {/* Book Cover */}
                  <Box sx={{ width: { xs: '100%', sm: 120 }, flexShrink: 0 }}>
                    <CardMedia
                      component="img"
                      image={book.coverUrl}
                      alt={book.title}
                      sx={{
                        width: { xs: '100%', sm: 120 },
                        aspectRatio: '2/3',
                        objectFit: 'cover',
                        borderRadius: 1,
                        maxWidth: { xs: 180, sm: 'none' },
                        mx: { xs: 'auto', sm: 0 }
                      }}
                    />
                  </Box>

                  {/* Book Info */}
                  <CardContent sx={{ p: '0 !important', flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: '"Georgia", serif', fontWeight: 'bold', lineHeight: 1.3, mb: 0.5 }}
                    >
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      bởi <span style={{ fontStyle: 'italic' }}>{book.author}</span>
                    </Typography>
                    <Chip
                      label={`Đã thêm ngày ${book.addedDate}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </CardContent>

                  {/* Price */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {book.price}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 160 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ShoppingCartOutlinedIcon />}
                      onClick={() => handleAddToCart(book)}
                      size="small"
                    >
                      Thêm vào giỏ
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleRemove(book.id)}
                      size="small"
                    >
                      Xóa
                    </Button>
                  </Box>

                  {/* Remove Icon (mobile) */}
                  <Tooltip title="Xóa khỏi Wishlist">
                    <IconButton
                      onClick={() => handleRemove(book.id)}
                      sx={{ color: 'error.light', display: { xs: 'none', md: 'flex' } }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default WishlistPage
