import {
  Box, Container, Typography, Grid, Button, Paper, IconButton, Divider, Breadcrumbs, Link, Checkbox
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { formatPrice } from '../../utils/formatPrice'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState({})  // Track selected items

  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(storedCart)
    }

    loadCart()
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [])

  const syncCart = (nextCart) => {
    setCartItems(nextCart)
    localStorage.setItem('cart', JSON.stringify(nextCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleQuantityChange = (id, action) => {
    const nextCart = cartItems.map(item => {
      if (item.id === id) {
        if (action === 'increase') {
          return { ...item, quantity: item.quantity + 1 }
        } else if (action === 'decrease' && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 }
        }
      }
      return item
    })

    syncCart(nextCart)
  }

  const handleRemoveItem = (id) => {
    const nextCart = cartItems.filter(item => item.id !== id)
    syncCart(nextCart)
    // Bỏ chọn sản phẩm này
    setSelectedItems(prev => {
      const newSelected = { ...prev }
      delete newSelected[id]
      return newSelected
    })
  }

  const handleSelectItem = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSelectAll = () => {
    if (Object.keys(selectedItems).length === cartItems.length) {
      // Bỏ chọn tất cả
      setSelectedItems({})
    } else {
      // Chọn tất cả
      const allSelected = {}
      cartItems.forEach(item => {
        allSelected[item.id] = true
      })
      setSelectedItems(allSelected)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item.id]) {
        return total + (item.price * item.quantity)
      }
      return total
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const shippingFee = subtotal >= 800000 ? 0 : 30000
  const total = subtotal + shippingFee


  if (cartItems.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
              Giỏ hàng của bạn đang trống
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/books')}
              sx={{ px: 4 }}
            >
              Tiếp tục mua sắm
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
          <Typography color="text.primary">Giỏ hàng</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Giỏ hàng của bạn
        </Typography>

        <Grid container spacing={4}>
          {/* Left: Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {/* Select All Checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Checkbox
                  checked={Object.keys(selectedItems).length === cartItems.length && cartItems.length > 0}
                  indeterminate={Object.keys(selectedItems).length > 0 && Object.keys(selectedItems).length < cartItems.length}
                  onChange={handleSelectAll}
                />
                <Typography variant="body1">
                  {Object.keys(selectedItems).length === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Typography>
              </Box>

              {cartItems.map((item, index) => (
                <Box key={item.id}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Checkbox */}
                    <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Checkbox
                        checked={!!selectedItems[item.id]}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </Grid>

                    {/* Product Image */}
                    <Grid item xs={2}>
                      <Box
                        onClick={() => navigate(`/books/${item.id}`)}
                        sx={{
                          bgcolor: '#f0f0f0',
                          borderRadius: 1,
                          overflow: 'hidden',
                          aspectRatio: '2/3',
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
                    </Grid>

                    {/* Product Info */}
                    <Grid item xs={8} sm={4}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          mb: 0.5,
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => navigate(`/books/${item.id}`)}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.author}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {formatPrice(item.price)}
                      </Typography>
                    </Grid>

                    {/* Quantity Controls */}
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1, width: 'fit-content' }}>
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, 'decrease')}
                          size="small"
                          disabled={item.quantity === 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          onClick={() => handleQuantityChange(item.id, 'increase')}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Remove Button */}
                    <Grid item xs={6} sm={2} sx={{ textAlign: 'right' }}>
                      <IconButton
                        onClick={() => handleRemoveItem(item.id)}
                        color="error"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>

                  {index < cartItems.length - 1 && <Divider sx={{ my: 3 }} />}
                </Box>
              ))}

              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/books')}
                >
                  Tiếp tục mua sắm
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right: Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Tóm tắt đơn hàng
              </Typography>

              {Object.keys(selectedItems).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, p: 1, bgcolor: '#fff3cd', borderRadius: 1 }}>
                  Chọn sản phẩm để xem tóm tắt
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sản phẩm được chọn: {Object.keys(selectedItems).length}
                  </Typography>
                </>
              )}

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1">Tạm tính:</Typography>
                  <Typography variant="body1">{formatPrice(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1">Phí vận chuyển:</Typography>
                  <Typography variant="body1" color={shippingFee === 0 ? 'success.main' : 'text.primary'}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Tổng cộng:
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(total)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={Object.keys(selectedItems).length === 0}
                onClick={() => {
                  if (Object.keys(selectedItems).length === 0) {
                    alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
                    return
                  }
                  const selectedCartItems = cartItems.filter(item => selectedItems[item.id])
                  navigate('/checkout', { state: { cartItems: selectedCartItems } })
                }}
                sx={{ py: 1.5, fontSize: '1.1rem', mb: 2 }}
              >
                {Object.keys(selectedItems).length === 0 ? 'Chọn sản phẩm để thanh toán' : 'Thanh toán'}
              </Button>

              {/* Shipping Info */}
              {subtotal < 800000 && (
                <Box sx={{
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'start',
                  gap: 1
                }}>
                  <LocalShippingOutlinedIcon color="primary" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">
                    Thêm <strong>{formatPrice(800000 - subtotal)}</strong> để được miễn phí vận chuyển
                  </Typography>
                </Box>
              )}


            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Cart