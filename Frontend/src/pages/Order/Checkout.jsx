import {
  Box, Container, Typography, Grid, Button, Paper, TextField,
  Divider, RadioGroup, FormControlLabel, Radio, Breadcrumbs, Link
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = location.state?.cartItems || []

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'COD',
    note: ''
  })

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const subtotal = calculateSubtotal()
  const shippingFee = subtotal >= 800000 ? 0 : 30000
  const total = subtotal + shippingFee

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitOrder = async () => {
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone ||
        !formData.address || !formData.city) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Email không hợp lệ!')
      return
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại không hợp lệ! (10 chữ số)')
      return
    }

    const fullAddress = [formData.address, formData.ward, formData.district, formData.city]
      .filter(Boolean)
      .join(', ')

    const paymentMap = {
      COD: 'COD',
      'Chuyển khoản': 'BANK_TRANSFER',
      'Thẻ tín dụng': 'CREDIT_CARD',
      'Ví điện tử': 'E_WALLET'
    }

    const payload = {
      customerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: fullAddress,
      paymentMethod: paymentMap[formData.paymentMethod] || 'COD',
      note: formData.note,
      items: cartItems.map((item) => ({
        bookId: item.id,
        quantity: item.quantity
      }))
    }

    try {
      const createdOrder = await orderService.createOrder(payload)
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))

      navigate('/my-orders', {
        state: {
          message: 'Đặt hàng thành công!',
          newOrderId: createdOrder?.orderCode || createdOrder?.id
        }
      })
    } catch (error) {
      alert(error.message || 'Đặt hàng thất bại!')
    }
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
              Không có sản phẩm để thanh toán
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/cart')}
            >
              Quay lại giỏ hàng
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
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/cart')}
            sx={{ cursor: 'pointer' }}
          >
            Giỏ hàng
          </Link>
          <Typography color="text.primary">Thanh toán</Typography>
        </Breadcrumbs>

        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Thanh toán
        </Typography>

        <Grid container spacing={4}>
          {/* Left: Checkout Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Thông tin giao hàng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0901234567"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Số nhà, tên đường"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phường/Xã"
                    value={formData.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Quận/Huyện"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Tỉnh/Thành phố"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="TP. Hồ Chí Minh"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={formData.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    placeholder="Ghi chú về đơn hàng (tuỳ chọn)"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Phương thức thanh toán
              </Typography>
              <RadioGroup
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
              >
                <FormControlLabel
                  value="COD"
                  control={<Radio />}
                  label="Thanh toán khi nhận hàng (COD)"
                />
                <FormControlLabel
                  value="Chuyển khoản"
                  control={<Radio />}
                  label="Chuyển khoản ngân hàng"
                />
                <FormControlLabel
                  value="Thẻ tín dụng"
                  control={<Radio />}
                  label="Thẻ tín dụng/Ghi nợ"
                />
                <FormControlLabel
                  value="Ví điện tử"
                  control={<Radio />}
                  label="Ví điện tử (MoMo, ZaloPay)"
                />
              </RadioGroup>
            </Paper>
          </Grid>

          {/* Right: Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Đơn hàng ({cartItems.length} sản phẩm)
              </Typography>

              {/* Products List */}
              <Box sx={{ mb: 2 }}>
                {cartItems.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 80,
                        bgcolor: '#f0f0f0',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Số lượng: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Summary */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>{formatPrice(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography color={shippingFee === 0 ? 'success.main' : 'text.primary'}>
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
                onClick={handleSubmitOrder}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                Đặt hàng
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Checkout
