import {
  Alert, Box, Container, Typography, Paper, Grid, Chip, Divider,
  Breadcrumbs, Link, Button, Table, TableBody, TableCell,
  TableHead, TableRow
} from '@mui/material'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'
import {
  BANK_TRANSFER_INFO,
  formatPaymentMethodLabel,
  getBankTransferContent,
  hasBankTransferInfo,
  isBankTransferPayment
} from '../../utils/payment'

const OrderDetailUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [isConfirmingReceived, setIsConfirmingReceived] = useState(false)
  const [isCancellingOrder, setIsCancellingOrder] = useState(false)

  const loadOrder = useCallback(async () => {
    try {
      const order = await orderService.getOrderById(id)
      setOrderData(order)
    } catch {
      navigate('/my-orders')
    }
  }, [id, navigate])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const getStatusColor = (status) => {
    switch (status) {
    case 'RECEIVED': return 'success'
    case 'DELIVERED': return 'success'
    case 'SHIPPING': return 'info'
    case 'PENDING': return 'warning'
    case 'CONFIRMED': return 'info'
    case 'CANCELLED': return 'error'
    default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
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

  const handleConfirmReceived = async () => {
    if (!orderData?.id || isConfirmingReceived) return

    try {
      setIsConfirmingReceived(true)
      const updatedOrder = await orderService.confirmReceived(orderData.id)
      setOrderData(updatedOrder)
    } catch (error) {
      alert(error.message || 'Xác nhận nhận hàng thất bại!')
    } finally {
      setIsConfirmingReceived(false)
    }
  }

  const handleGoToReview = () => {
    const reviewOrderId = orderData?.id || id
    if (!reviewOrderId) return

    navigate(`/my-orders/${reviewOrderId}/review`, { state: { order: orderData } })
  }

  const handleCancelOrder = async () => {
    if (!orderData?.id || isCancellingOrder || orderData.status !== 'PENDING') return

    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')
    if (!confirmed) return

    try {
      setIsCancellingOrder(true)
      const updatedOrder = await orderService.cancelMyOrder(orderData.id)
      setOrderData(updatedOrder)
    } catch (error) {
      alert(error.message || 'Hủy đơn hàng thất bại!')
    } finally {
      setIsCancellingOrder(false)
    }
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const price = Number(item?.price || 0)
      const quantity = Number(item?.quantity || 0)
      const subtotal = Number(item?.subtotal || (price * quantity) || 0)
      return sum + subtotal
    }, 0)
  }

  const calculateTotal = () => {
    return orderData?.totalAmount || 0
  }

  const paymentStatusRaw = String(orderData?.paymentLinkStatus || '').trim().toUpperCase()
  const isPaid = paymentStatusRaw === 'PAID'
  const isCancelled = orderData?.status === 'CANCELLED'
  const paymentStatusLabel = isPaid
    ? 'Đã thanh toán'
    : paymentStatusRaw === 'PENDING'
      ? 'Chưa thanh toán'
      : (orderData?.paymentLinkStatus || '')

  const hasPayOSPaymentInfo = Boolean(orderData?.paymentQrCode || orderData?.paymentCheckoutUrl)
  const payOSQrRawValue = orderData?.paymentQrCode || orderData?.paymentCheckoutUrl || ''
  const payOSQrValue = typeof payOSQrRawValue === 'string' ? payOSQrRawValue.trim() : ''
  const isImageQr = payOSQrValue.startsWith('data:image') || payOSQrValue.includes('qr.payos.vn')
  const qrPayload = payOSQrValue.length > 1500 && orderData?.paymentCheckoutUrl
    ? String(orderData.paymentCheckoutUrl)
    : payOSQrValue
  const canRenderQr = !isPaid && !isCancelled && qrPayload.length > 0
  const qrImageSrc = canRenderQr
    ? (isImageQr
      ? qrPayload
      : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`)
    : ''
  const orderItems = (Array.isArray(orderData?.items) ? orderData.items : []).filter(Boolean)

  const formatOrderDate = (value) => {
    try {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('vi-VN')
    } catch {
      return '-'
    }
  }

  if (!orderData) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Đang tải...
            </Typography>
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
            onClick={() => navigate('/my-orders')}
            sx={{ cursor: 'pointer' }}
          >
            Đơn hàng của tôi
          </Link>
          <Typography color="text.primary">Chi tiết đơn hàng</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/my-orders')}
              variant="outlined"
            >
              Quay lại
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Đơn hàng #{orderData.orderCode || orderData.id}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(orderData.status)}
            color={getStatusColor(orderData.status)}
            size="large"
            sx={{ fontSize: '1rem', py: 2.5 }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Order Info */}
          <Grid item xs={12} md={8}>
            {/* Order Status Timeline */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Trạng thái đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Ngày đặt:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatOrderDate(orderData.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={getStatusLabel(orderData.status)}
                    color={getStatusColor(orderData.status)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Thanh toán:
                  </Typography>
                  <Typography variant="body2">
                    {formatPaymentMethodLabel(orderData.paymentMethod)}
                  </Typography>
                </Box>
                {isBankTransferPayment(orderData.paymentMethod) && (
                  <Alert severity={hasPayOSPaymentInfo || hasBankTransferInfo ? 'info' : 'warning'}>
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Thông tin thanh toán
                      </Typography>

                      {isPaid && (
                        <Chip
                          label="Đã thanh toán"
                          color="success"
                          size="small"
                          sx={{ width: 'fit-content' }}
                        />
                      )}

                      {canRenderQr ? (
                        <Box sx={{ p: 2, bgcolor: '#fff', width: 'fit-content', borderRadius: 2 }}>
                          <img
                            src={qrImageSrc}
                            alt="QR thanh toan"
                            style={{ width: 180, height: 180, objectFit: 'contain' }}
                          />
                        </Box>
                      ) : (
                        <></>
                      )}

                      {!isPaid && !isCancelled && orderData.paymentCheckoutUrl && (
                        <Button
                          variant="outlined"
                          startIcon={<OpenInNewIcon />}
                          onClick={() => window.open(orderData.paymentCheckoutUrl, '_blank', 'noopener,noreferrer')}
                          sx={{ width: 'fit-content' }}
                        >
                          Mở link thanh toán PayOS
                        </Button>
                      )}

                      {orderData.paymentLinkStatus && (
                        <Typography variant="body2" color={String(orderData.paymentLinkStatus).startsWith('FAILED') ? 'error.main' : 'text.secondary'}>
                          Trạng thái thanh toán: {paymentStatusLabel}
                        </Typography>
                      )}

                      <Typography variant="body2">Nội dung: {getBankTransferContent(orderData.orderCode || orderData.id)}</Typography>

                      {hasBankTransferInfo ? (
                        <>
                          <Typography variant="body2">Ngân hàng: {BANK_TRANSFER_INFO.bankName}</Typography>
                          <Typography variant="body2">Chủ tài khoản: {BANK_TRANSFER_INFO.accountName}</Typography>
                          <Typography variant="body2">Số tài khoản: {BANK_TRANSFER_INFO.accountNumber}</Typography>
                        </>
                      ) : null}
                    </Box>
                  </Alert>
                )}
                {orderData.note && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                      Ghi chú:
                    </Typography>
                    <Typography variant="body2">
                      {orderData.note}
                    </Typography>
                  </Box>
                )}
                {orderData.status === 'DELIVERED' && (
                  <Box sx={{ pt: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleConfirmReceived}
                      disabled={isConfirmingReceived}
                    >
                      {isConfirmingReceived ? 'Đang xử lý...' : 'Đã nhận được đơn hàng'}
                    </Button>
                  </Box>
                )}
                {orderData.status === 'PENDING' && (
                  <Box sx={{ pt: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCancelOrder}
                      disabled={isCancellingOrder}
                    >
                      {isCancellingOrder ? 'Đang hủy...' : 'Hủy đơn hàng'}
                    </Button>
                  </Box>
                )}
                {orderData.status === 'RECEIVED' && (
                  <Box sx={{ pt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGoToReview}
                    >
                      Đánh giá đơn hàng
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Products List */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Sản phẩm ({orderItems.length})
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="center">Số lượng</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                              src={item.bookCoverUrl}
                              alt={item.bookTitle}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.bookTitle}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatPrice(item.price)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatPrice(Number(item?.subtotal || (Number(item?.price || 0) * Number(item?.quantity || 0)) || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Customer Info & Summary */}
          <Grid item xs={12} md={4}>
            {/* Customer Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thông tin giao hàng
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Người nhận
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {orderData.customerName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {orderData.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {orderData.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {orderData.address}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Order Summary */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Tổng kết đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>{formatPrice(calculateSubtotal())}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography>{formatPrice(orderData.shippingFee || 0)}</Typography>
                </Box>
                {(orderData.discount || 0) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Giảm giá:</Typography>
                    <Typography color="error">-{formatPrice(orderData.discount || 0)}</Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatPrice(calculateTotal())}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default OrderDetailUser
