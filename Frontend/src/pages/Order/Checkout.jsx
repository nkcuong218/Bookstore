import {
  Box, Container, Typography, Grid, Button, Paper, TextField,
  Divider, RadioGroup, FormControlLabel, Radio, Breadcrumbs, Link,
  Alert, Checkbox, CircularProgress, MenuItem
} from '@mui/material'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'
import userService from '../../apis/userService'
import addressService from '../../apis/addressService'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = location.state?.cartItems || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAddressBook, setIsLoadingAddressBook] = useState(true)
  const [addressError, setAddressError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [addressMode, setAddressMode] = useState('existing')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'COD'
  })

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId) return null
    return savedAddresses.find((addr) => String(addr.id) === String(selectedAddressId)) || null
  }, [savedAddresses, selectedAddressId])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const loadCheckoutData = async () => {
      setAddressError('')
      setIsLoadingAddressBook(true)
      try {
        const profile = await userService.getProfile()
        setFormData((prev) => ({
          ...prev,
          email: profile?.email || ''
        }))
      } catch (error) {
        console.error('Không tải được hồ sơ người dùng:', error)
      }

      try {
        const addresses = await addressService.getMyAddresses()

        const normalized = Array.isArray(addresses) ? addresses : []
        setSavedAddresses(normalized)

        if (normalized.length > 0) {
          const defaultAddress = normalized.find((addr) => addr.isDefault) || normalized[0]
          setAddressMode('existing')
          setSelectedAddressId(String(defaultAddress.id))
        } else {
          setAddressMode('new')
        }
      } catch (error) {
        const message = error?.message || ''
        const isNotFound = message === 'Not Found' || message.includes('HTTP 404')
        setSavedAddresses([])
        setAddressMode('new')
        if (!isNotFound) {
          setAddressError('Không tải được danh sách địa chỉ. Bạn có thể nhập địa chỉ mới để tiếp tục.')
        }
      } finally {
        setIsLoadingAddressBook(false)
      }
    }

    loadCheckoutData()
  }, [navigate])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const subtotal = calculateSubtotal()
  const shippingFee = subtotal >= 800000 ? 0 : 30000
  const total = subtotal + shippingFee
  const cityOptions = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng']

  const districtOptionsByCity = {
    'Hà Nội': ['Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy', 'Hoàn Kiếm'],
    'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Phú Nhuận', 'Bình Thạnh'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà'],
    'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'],
    'Hải Phòng': ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền']
  }

  const districtOptions = districtOptionsByCity[formData.city] || []

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatAddressFromForm = () => {
    return [formData.address, formData.ward, formData.district, formData.city]
      .filter(Boolean)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ')
  }

  const handleSubmitOrder = async () => {
    if (isSubmitting) return

    if (addressMode === 'new' && (!formData.fullName || !formData.phone)) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại!')
      return
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại không hợp lệ! (10 chữ số)')
      return
    }

    if (addressMode === 'existing' && !selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng có sẵn!')
      return
    }

    if (addressMode === 'new' && (!formData.address || !formData.city)) {
      alert('Vui lòng điền đầy đủ địa chỉ mới!')
      return
    }

    const fullAddress = addressMode === 'existing'
      ? selectedAddress.fullAddress
      : formatAddressFromForm()

    const paymentMap = {
      COD: 'COD',
      'Chuyển khoản': 'BANK_TRANSFER',
      'Thẻ tín dụng': 'CREDIT_CARD',
      'Ví điện tử': 'E_WALLET'
    }

    const payload = {
      customerName: addressMode === 'existing'
        ? (selectedAddress?.recipientName || formData.fullName)
        : formData.fullName,
      email: formData.email || '',
      phone: addressMode === 'existing'
        ? (selectedAddress?.phone || formData.phone)
        : formData.phone,
      address: fullAddress,
      paymentMethod: paymentMap[formData.paymentMethod] || 'COD',
      items: cartItems.map((item) => ({
        bookId: item.id,
        quantity: item.quantity
      }))
    }

    try {
      setIsSubmitting(true)

      if (addressMode === 'new' && saveNewAddress) {
        const createdAddress = await addressService.createAddress({
          recipientName: formData.fullName,
          phone: formData.phone,
          addressLine: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          setDefault: true
        })
        setSavedAddresses((prev) => [createdAddress, ...prev.filter((item) => item.id !== createdAddress.id)])
        setSelectedAddressId(String(createdAddress.id))
      }

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
    } finally {
      setIsSubmitting(false)
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
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}
                >
                  1
                </Box>
                <PlaceOutlinedIcon sx={{ color: '#d03d3d', fontSize: 24 }} />
                <Typography sx={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: 0.4 }}>
                  ĐỊA CHỈ NHẬN HÀNG
                </Typography>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {savedAddresses.map((addr) => {
                      const isActive =
                        addressMode === 'existing' && String(addr.id) === String(selectedAddressId)

                      return (
                        <Grid item xs={12} key={addr.id}>
                          <Paper
                            variant="outlined"
                            onClick={() => {
                              setAddressMode('existing')
                              setSelectedAddressId(String(addr.id))
                            }}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              borderRadius: 2,
                              borderWidth: 1,
                              borderColor: isActive ? '#4677d8' : '#d6d7db',
                              bgcolor: '#fff',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Radio
                                checked={isActive}
                                onChange={() => {
                                  setAddressMode('existing')
                                  setSelectedAddressId(String(addr.id))
                                }}
                                value={addr.id}
                                sx={{ p: 0.5 }}
                              />

                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>
                                    {addr.recipientName}
                                  </Typography>
                                  <Typography sx={{ color: '#4b5563', fontWeight: 500, fontSize: '1rem' }}>
                                    {addr.phone}
                                  </Typography>
                                  {addr.isDefault && (
                                    <Box
                                      sx={{
                                        px: 1.1,
                                        py: 0.25,
                                        borderRadius: 10,
                                        bgcolor: '#efeff0',
                                        color: '#3f3f46',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        lineHeight: 1.2
                                      }}
                                    >
                                      Mặc định
                                    </Box>
                                  )}
                                </Box>

                                <Typography sx={{ mt: 0.6, color: '#4b5563', fontSize: '1.02rem' }}>
                                  {addr.fullAddress}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      )
                    })}

                    <Grid item xs={12}>
                      <Paper
                        variant="outlined"
                        onClick={() => setAddressMode('new')}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderRadius: 2,
                          borderWidth: 1,
                          borderColor: addressMode === 'new' ? '#d03d3d' : '#d6d7db',
                          bgcolor: '#fffafa'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Radio
                            checked={addressMode === 'new'}
                            onChange={() => setAddressMode('new')}
                            value="new"
                            sx={{ p: 0.5 }}
                          />
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                            Sử dụng địa chỉ khác
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>

                {isLoadingAddressBook && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Đang tải sổ địa chỉ...
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {addressError && (
                  <Grid item xs={12}>
                    <Alert severity="warning">{addressError}</Alert>
                  </Grid>
                )}

                {addressMode === 'existing' && savedAddresses.length === 0 && !isLoadingAddressBook && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Bạn chưa có địa chỉ đã lưu. Hãy chọn "Sử dụng địa chỉ khác" để tiếp tục.
                    </Alert>
                  </Grid>
                )}

                {addressMode === 'new' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 0.5 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ tên *"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SĐT *"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="0901234567"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Tỉnh/Thành"
                        value={formData.city}
                        onChange={(e) => {
                          handleChange('city', e.target.value)
                          handleChange('district', '')
                        }}
                      >
                        {cityOptions.map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Quận/Huyện"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                      >
                        {districtOptions.map((district) => (
                          <MenuItem key={district} value={district}>{district}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Địa chỉ *"
                        required
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Số nhà, tên đường"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                          />
                        )}
                        label="Lưu địa chỉ này cho lần mua tiếp theo"
                      />
                    </Grid>
                  </>
                )}
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
                disabled={isSubmitting}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Checkout
