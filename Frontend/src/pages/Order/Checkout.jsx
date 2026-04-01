import {
  Box, Container, Typography, Grid, Button, Paper, TextField,
  Divider, RadioGroup, FormControlLabel, Radio, Breadcrumbs, Link,
  Alert, Checkbox, CircularProgress, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'
import userService from '../../apis/userService'
import addressService from '../../apis/addressService'
import discountCodeService from '../../apis/discountCodeService'
import vietnamProvincesService from '../../apis/vietnamProvincesService'

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
  const [appliedProductCoupon, setAppliedProductCoupon] = useState(null)
  const [appliedShippingCoupon, setAppliedShippingCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [selectedProductCouponCode, setSelectedProductCouponCode] = useState('')
  const [selectedShippingCouponCode, setSelectedShippingCouponCode] = useState('')
  const [couponRules, setCouponRules] = useState({})
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [isLocationLoading, setIsLocationLoading] = useState(false)

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
        // Keep checkout usable if profile fetch fails.
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

  useEffect(() => {
    const loadProvinces = async () => {
      setIsLocationLoading(true)
      try {
        const provinces = await vietnamProvincesService.getProvinces()
        setProvinceOptions(Array.isArray(provinces) ? provinces : [])
      } catch {
        setProvinceOptions([])
      } finally {
        setIsLocationLoading(false)
      }
    }

    loadProvinces()
  }, [])

  useEffect(() => {
    const province = provinceOptions.find((item) => item.name === formData.city)
    if (!province?.code) {
      setDistrictOptions([])
      return
    }

    setDistrictOptions(Array.isArray(province.districts) ? province.districts : [])
  }, [provinceOptions, formData.city])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const myCodes = await discountCodeService.getMyCodes()
        const mappedRules = (Array.isArray(myCodes) ? myCodes : [])
          .filter((code) => String(code?.status || '').toUpperCase() === 'ASSIGNED')
          .reduce((acc, code) => {
            const normalizedCode = String(code?.code || '').trim().toUpperCase()
            if (!normalizedCode) return acc

            const normalizedCategory = String(code?.category || 'PRODUCT').toUpperCase() === 'SHIPPING'
              ? 'shipping'
              : 'product'
            const normalizedType = String(code?.type || 'FIXED').toUpperCase() === 'PERCENT'
              ? 'percent'
              : 'fixed'

            acc[normalizedCode] = {
              code: normalizedCode,
              description: code?.description || normalizedCode,
              minOrder: Number(code?.minOrder || 0),
              category: normalizedCategory,
              type: normalizedType,
              value: Number(code?.value || 0),
              maxDiscount: code?.maxDiscount != null ? Number(code.maxDiscount) : undefined
            }

            return acc
          }, {})

        setCouponRules(mappedRules)
      } catch {
        setCouponRules({})
      }
    }

    loadCoupons()
  }, [])

  const ownedCoupons = Object.values(couponRules)
  const shippingCoupons = ownedCoupons.filter((coupon) => coupon.category === 'shipping')
  const productCoupons = ownedCoupons.filter((coupon) => coupon.category === 'product')

  const subtotal = calculateSubtotal()
  const shippingFee = subtotal >= 800000 ? 0 : 30000
  const isCouponEligible = (coupon) => {
    if (!coupon) return false
    if (subtotal < coupon.minOrder) return false
    if (coupon.category === 'shipping' && shippingFee <= 0) return false
    return true
  }

  const getCouponDiscountValue = (coupon) => {
    if (!coupon || !isCouponEligible(coupon)) return 0

    const baseAmount = coupon.category === 'shipping' ? shippingFee : subtotal

    if (coupon.type === 'fixed') {
      return Math.min(coupon.value, baseAmount)
    }

    if (coupon.type === 'percent') {
      const calculated = Math.round((baseAmount * coupon.value) / 100)
      return Math.min(calculated, coupon.maxDiscount || calculated)
    }

    return 0
  }

  const productDiscountAmount = getCouponDiscountValue(appliedProductCoupon)
  const shippingDiscountAmount = getCouponDiscountValue(appliedShippingCoupon)
  const shippingFeeAfterDiscount = Math.max(shippingFee - shippingDiscountAmount, 0)
  const total = Math.max(subtotal - productDiscountAmount + shippingFeeAfterDiscount, 0)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatAddressFromForm = () => {
    return [formData.address, formData.district, formData.city]
      .filter(Boolean)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ')
  }

  const normalizeVietnamPhone = (phone) => {
    const digitsOnly = String(phone || '').replace(/\D/g, '')

    // Convert +84xxxxxxxxx or 84xxxxxxxxx to 0xxxxxxxxx
    if (digitsOnly.startsWith('84') && digitsOnly.length === 11) {
      return `0${digitsOnly.slice(2)}`
    }

    return digitsOnly
  }

  const handleOpenCouponDialog = () => {
    setSelectedProductCouponCode(appliedProductCoupon?.code || '')
    setSelectedShippingCouponCode(appliedShippingCoupon?.code || '')
    setCouponError('')
    setIsCouponDialogOpen(true)
  }

  const handleApplyCouponFromDialog = () => {
    const selectedProductCoupon = selectedProductCouponCode
      ? couponRules[selectedProductCouponCode]
      : null
    const selectedShippingCoupon = selectedShippingCouponCode
      ? couponRules[selectedShippingCouponCode]
      : null

    if (selectedProductCoupon && !isCouponEligible(selectedProductCoupon)) {
      setCouponError(`Mã ${selectedProductCoupon.code} cần đơn tối thiểu ${formatPrice(selectedProductCoupon.minOrder)}`)
      return
    }

    if (selectedShippingCoupon && !isCouponEligible(selectedShippingCoupon)) {
      if (shippingFee <= 0) {
        setCouponError('Đơn hàng hiện đã miễn phí vận chuyển, không cần mã ship')
      } else {
        setCouponError(`Mã ${selectedShippingCoupon.code} cần đơn tối thiểu ${formatPrice(selectedShippingCoupon.minOrder)}`)
      }
      return
    }

    setAppliedProductCoupon(selectedProductCoupon)
    setAppliedShippingCoupon(selectedShippingCoupon)
    setCouponError('')
    setIsCouponDialogOpen(false)
  }

  const handleRemoveCoupon = (mode) => {
    if (mode === 'shipping') {
      setAppliedShippingCoupon(null)
    } else {
      setAppliedProductCoupon(null)
    }
    if (mode === 'shipping') {
      setSelectedShippingCouponCode('')
    } else {
      setSelectedProductCouponCode('')
    }
    setCouponError('')
  }

  const handleSubmitOrder = async () => {
    if (isSubmitting) return

    if (addressMode === 'new' && (!formData.fullName || !formData.phone)) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại!')
      return
    }

    if (addressMode === 'existing' && !selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng có sẵn!')
      return
    }

    if (addressMode === 'new' && (!formData.address || !formData.city || !formData.district)) {
      alert('Vui lòng điền đầy đủ địa chỉ mới!')
      return
    }

    const rawPhone = addressMode === 'existing'
      ? (selectedAddress?.phone || '')
      : formData.phone

    const normalizedPhone = normalizeVietnamPhone(rawPhone)

    // Phone validation
    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(normalizedPhone)) {
      alert('Số điện thoại không hợp lệ! (10 chữ số, bắt đầu bằng 0)')
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
      phone: normalizedPhone,
      address: fullAddress,
      paymentMethod: paymentMap[formData.paymentMethod] || 'COD',
      productDiscountCode: appliedProductCoupon?.code || undefined,
      shippingDiscountCode: appliedShippingCoupon?.code || undefined,
      note: [
        appliedProductCoupon ? `Mã SP: ${appliedProductCoupon.code}` : null,
        appliedShippingCoupon ? `Mã Ship: ${appliedShippingCoupon.code}` : null
      ].filter(Boolean).join(' | ') || undefined,
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
          phone: normalizedPhone,
          addressLine: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          setDefault: true
        })
        setSavedAddresses((prev) => [createdAddress, ...prev.filter((item) => item.id !== createdAddress.id)])
        setSelectedAddressId(String(createdAddress.id))
      }

      if (appliedProductCoupon?.code) {
        await discountCodeService.saveMyCode(appliedProductCoupon.code)
      }

      if (appliedShippingCoupon?.code) {
        await discountCodeService.saveMyCode(appliedShippingCoupon.code)
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
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
                      Bạn chưa có địa chỉ đã lưu. Hãy chọn &quot;Sử dụng địa chỉ khác&quot; để tiếp tục.
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
                        disabled={isLocationLoading}
                      >
                        {provinceOptions.map((province) => (
                          <MenuItem key={province.code} value={province.name}>{province.name}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Quận/Huyện"
                        value={formData.district}
                        onChange={(e) => {
                          handleChange('district', e.target.value)
                        }}
                        disabled={!formData.city || isLocationLoading}
                      >
                        {districtOptions.map((district) => (
                          <MenuItem key={district.code} value={district.name}>{district.name}</MenuItem>
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

            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  MÃ GIẢM GIÁ
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    onClick={handleOpenCouponDialog}
                    sx={{
                      py: 1.4,
                      px: 1.8,
                      borderRadius: 2.2,
                      textTransform: 'none',
                      border: '1px solid #d9e4ff',
                      background: 'linear-gradient(135deg, #eff4ff 0%, #f5f9ff 45%, #eef8ff 100%)',
                      color: '#123a78',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 6px 18px rgba(40, 94, 176, 0.12)',
                      '&:hover': {
                        borderColor: '#8fb1ec',
                        background: 'linear-gradient(135deg, #e4eeff 0%, #eff6ff 45%, #e7f4ff 100%)',
                        boxShadow: '0 10px 24px rgba(40, 94, 176, 0.18)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
                        Chọn mã giảm giá
                      </Typography>
                      <Typography sx={{ fontSize: '0.84rem', color: '#426aa7', mt: 0.3 }}>
                        Mã ship ở trên, mã sản phẩm ở dưới
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#2f5ea8' }}>
                      {'>'}
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {appliedShippingCoupon && (
                      <Chip
                        color="success"
                        label={`${appliedShippingCoupon.code} - Giảm ship ${formatPrice(shippingDiscountAmount)}`}
                        onDelete={() => handleRemoveCoupon('shipping')}
                      />
                    )}
                    {appliedProductCoupon && (
                      <Chip
                        color="success"
                        label={`${appliedProductCoupon.code} - Giảm SP ${formatPrice(productDiscountAmount)}`}
                        onDelete={() => handleRemoveCoupon('product')}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Typography sx={{ mt: 1.5, color: couponError ? 'error.main' : 'text.secondary', fontSize: '0.92rem' }}>
                {couponError || 'Mỗi loại chỉ áp dụng được 1 mã: 1 mã sản phẩm + 1 mã vận chuyển'}
              </Typography>
            </Paper>

            <Dialog
              open={isCouponDialogOpen}
              onClose={() => setIsCouponDialogOpen(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Chọn mã giảm giá</DialogTitle>
              <DialogContent dividers>
                <Typography sx={{ mb: 1, fontWeight: 800 }}>Mã giảm phí vận chuyển</Typography>
                <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                  {shippingCoupons.length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">Bạn chưa lưu mã nào</Typography>
                    </Grid>
                  )}
                  {shippingCoupons.map((coupon) => {
                    const isSelected = selectedShippingCouponCode === coupon.code
                    const eligible = isCouponEligible(coupon)
                    const previewDiscount = getCouponDiscountValue(coupon)

                    return (
                      <Grid item xs={12} key={coupon.code}>
                        <Paper
                          variant="outlined"
                          onClick={() => {
                            setSelectedShippingCouponCode((prev) => (prev === coupon.code ? '' : coupon.code))
                            setCouponError('')
                          }}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            borderColor: isSelected ? '#1976d2' : '#d6d7db',
                            bgcolor: isSelected ? '#f3f8ff' : '#fff',
                            opacity: eligible ? 1 : 0.7
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>{coupon.code}</Typography>
                              <Typography variant="body2" color="text.secondary">{coupon.description}</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Đơn tối thiểu: {formatPrice(coupon.minOrder)}
                              </Typography>
                            </Box>

                            {eligible ? (
                              <Chip color="success" label={`Giảm ${formatPrice(previewDiscount)}`} size="small" />
                            ) : (
                              <Chip color="warning" label="Chưa đủ điều kiện" size="small" />
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>

                <Typography sx={{ mb: 1, fontWeight: 800 }}>Mã giảm giá sản phẩm</Typography>
                <Grid container spacing={1.5}>
                  {productCoupons.length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">Bạn chưa lưu mã nào</Typography>
                    </Grid>
                  )}
                  {productCoupons.map((coupon) => {
                    const isSelected = selectedProductCouponCode === coupon.code
                    const eligible = isCouponEligible(coupon)
                    const previewDiscount = getCouponDiscountValue(coupon)

                    return (
                      <Grid item xs={12} key={coupon.code}>
                        <Paper
                          variant="outlined"
                          onClick={() => {
                            setSelectedProductCouponCode((prev) => (prev === coupon.code ? '' : coupon.code))
                            setCouponError('')
                          }}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            borderColor: isSelected ? '#1976d2' : '#d6d7db',
                            bgcolor: isSelected ? '#f3f8ff' : '#fff',
                            opacity: eligible ? 1 : 0.7
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>{coupon.code}</Typography>
                              <Typography variant="body2" color="text.secondary">{coupon.description}</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Đơn tối thiểu: {formatPrice(coupon.minOrder)}
                              </Typography>
                            </Box>

                            {eligible ? (
                              <Chip color="success" label={`Giảm ${formatPrice(previewDiscount)}`} size="small" />
                            ) : (
                              <Chip color="warning" label="Chưa đủ điều kiện" size="small" />
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsCouponDialogOpen(false)}>
                  Hủy
                </Button>
                <Button variant="contained" onClick={handleApplyCouponFromDialog}>
                  Áp dụng
                </Button>
              </DialogActions>
            </Dialog>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                PHƯƠNG THỨC THANH TOÁN
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
                  <Typography color={shippingFeeAfterDiscount === 0 ? 'success.main' : 'text.primary'}>
                    {shippingFeeAfterDiscount === 0 ? 'Miễn phí' : formatPrice(shippingFeeAfterDiscount)}
                  </Typography>
                </Box>
                {shippingDiscountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography>Giảm phí ship:</Typography>
                    <Typography color="error.main">-{formatPrice(shippingDiscountAmount)}</Typography>
                  </Box>
                )}
                {productDiscountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography>Giảm giá sản phẩm:</Typography>
                    <Typography color="error.main">-{formatPrice(productDiscountAmount)}</Typography>
                  </Box>
                )}
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
