import {
  Box, Container, Typography, Paper, Chip, Button, Tabs, Tab,
  Grid, Breadcrumbs, Link, Alert, Stack
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import QRCode from 'react-qr-code'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'
import { formatPaymentMethodLabel, isBankTransferPayment, hasBankTransferInfo, BANK_TRANSFER_INFO, getBankTransferContent } from '../../utils/payment'

const MyOrders = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [tabValue, setTabValue] = useState('all')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [newOrderId, setNewOrderId] = useState(null)
  const paymentInfo = location.state?.paymentInfo || null
  const payOSQrValue = paymentInfo?.qrCode || paymentInfo?.checkoutUrl || ''

  useEffect(() => {
    loadOrders()

    // Check if coming from checkout with success message
    if (location.state?.message) {
      setShowSuccessMessage(true)
      setNewOrderId(location.state.newOrderId)

      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
        setNewOrderId(null)
      }, 5000)

      // Clear navigation state with React Router to avoid corrupting router history state
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })

      return () => clearTimeout(timer)
    }

    // Reload when window gains focus
    const handleFocus = () => loadOrders()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [location])

  const mapStatus = (status) => {
    const statusMap = {
      PENDING: 'Đang xử lý',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      RECEIVED: 'Đã nhận hàng',
      CANCELLED: 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const loadOrders = async () => {
    try {
      const response = await orderService.getMyOrders()
      setOrders(response || [])
    } catch {
      setOrders([])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
    case 'Đã nhận hàng': return 'success'
    case 'Đã giao': return 'success'
    case 'Đã xác nhận': return 'info'
    case 'Đang giao': return 'info'
    case 'Đang xử lý': return 'warning'
    case 'Đã hủy': return 'error'
    default: return 'default'
    }
  }

  const getPaymentStatusMeta = (order) => {
    if (!isBankTransferPayment(order?.paymentMethod)) {
      return null
    }

    const rawStatus = String(order?.paymentLinkStatus || '').trim().toUpperCase()
    if (rawStatus === 'PAID') {
      return { label: 'Đã thanh toán', color: 'success' }
    }

    if (rawStatus.startsWith('FAILED')) {
      return { label: 'Thanh toán lỗi', color: 'error' }
    }

    return { label: 'Chưa thanh toán', color: 'warning' }
  }

  const calculateTotal = (order) => order.totalAmount || 0

  const filteredOrders = tabValue === 'all'
    ? orders
    : orders.filter(order => {
      const statusLabel = mapStatus(order.status)
      switch (tabValue) {
      case 'processing': return statusLabel === 'Đang xử lý'
      case 'shipping': return statusLabel === 'Đang giao'
      case 'completed': return statusLabel === 'Đã giao' || statusLabel === 'Đã nhận hàng'
      case 'cancelled': return statusLabel === 'Đã hủy'
      default: return true
      }
    })

  const normalizedOrders = filteredOrders.map((order) => ({
    ...order,
    statusLabel: mapStatus(order.status)
  }))

  const formatOrderDate = (createdAt) => {
    try {
      return new Date(createdAt).toLocaleDateString('vi-VN')
    } catch {
      return ''
    }
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
              Bạn chưa có đơn hàng nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Hãy mua sắm và tạo đơn hàng đầu tiên của bạn
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/books')}
              sx={{ px: 4 }}
            >
              Mua sắm ngay
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
          <Typography color="text.primary">Đơn hàng của tôi</Typography>
        </Breadcrumbs>

        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Đơn hàng của tôi
        </Typography>

        {/* Success Message */}
        {showSuccessMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setShowSuccessMessage(false)}
          >
            Đặt hàng thành công! Đơn hàng của đã được tạo.
          </Alert>
        )}

        {showSuccessMessage && isBankTransferPayment(location.state?.paymentMethod) && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Đơn hàng này chọn chuyển khoản qua PayOS. Mở chi tiết đơn hàng để quét QR hoặc mở link thanh toán.
          </Alert>
        )}

        {payOSQrValue && (
          <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'primary.main' }}>
            <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <QRCode value={payOSQrValue} size={180} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Quét QR để chuyển khoản
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Đơn hàng: {paymentInfo.orderCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Số tiền: {formatPrice(paymentInfo.amount || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Nội dung: {getBankTransferContent(paymentInfo.orderCode)}
                </Typography>
                {hasBankTransferInfo && (
                  <Typography variant="body2" color="text.secondary">
                    TK nhận: {BANK_TRANSFER_INFO.accountName} - {BANK_TRANSFER_INFO.accountNumber} ({BANK_TRANSFER_INFO.bankName})
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                  {paymentInfo.checkoutUrl && (
                    <Button
                      variant="contained"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(paymentInfo.checkoutUrl, '_blank', 'noopener,noreferrer')}
                    >
                      Mở link thanh toán
                    </Button>
                  )}
                </Box>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Đang xử lý" value="processing" />
            <Tab label="Đang giao" value="shipping" />
            <Tab label="Đã giao" value="completed" />
            <Tab label="Đã hủy" value="cancelled" />
          </Tabs>
        </Paper>

        {/* Orders List */}
        {normalizedOrders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Không có đơn hàng nào
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {normalizedOrders.map((order) => {
              const paymentMeta = getPaymentStatusMeta(order)

              return (
                <Paper
                  key={order.id}
                  sx={{
                    p: 3,
                    border: (order.orderCode || order.id) === newOrderId ? '2px solid' : 'none',
                    borderColor: (order.orderCode || order.id) === newOrderId ? 'success.main' : 'transparent',
                    transition: 'all 0.3s ease',
                    animation: (order.orderCode || order.id) === newOrderId ? 'pulse 1s ease-in-out 2' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
                      '50%': { boxShadow: '0 0 20px 10px rgba(46, 125, 50, 0)' }
                    }
                  }}
                >
                  {/* Order Header */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Mã đơn hàng
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {order.orderCode}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ngày đặt
                        </Typography>
                        <Typography variant="body1">
                          {formatOrderDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Thanh toán
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body1">
                            {formatPaymentMethodLabel(order.paymentMethod)}
                          </Typography>
                          {paymentMeta && (
                            <Chip
                              size="small"
                              color={paymentMeta.color}
                              label={paymentMeta.label}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      label={order.statusLabel}
                      color={getStatusColor(order.statusLabel)}
                      size="medium"
                    />
                  </Box>

                  {/* Order Items */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {(order.items || []).map((item) => (
                      <Grid item xs={12} sm={6} md={3} key={item.id}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 80,
                              bgcolor: '#f0f0f0',
                              borderRadius: 1,
                              overflow: 'hidden',
                              flexShrink: 0
                            }}
                          >
                            <img
                              src={item.bookCoverUrl}
                              alt={item.bookTitle}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {item.bookTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              x{item.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                              {formatPrice(item.price)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Order Footer */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2,
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tổng tiền
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(calculateTotal(order))}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                    >
                    Xem chi tiết
                    </Button>
                  </Box>
                </Paper>
              )
            })}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default MyOrders
