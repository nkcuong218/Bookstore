import { 
  Box, Container, Typography, Paper, Grid, Chip, Divider, 
  Breadcrumbs, Link, Button, Table, TableBody, TableCell, 
  TableHead, TableRow 
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { formatPrice } from '../../utils/formatPrice'

const OrderDetailUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    
    // Find order by ID and verify it belongs to current user
    const order = allOrders.find(o => o.id === id && o.userId === currentUser.id)
    
    if (order) {
      setOrderData(order)
    } else {
      // Order not found or doesn't belong to user
      navigate('/my-orders')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã giao': return 'success'
      case 'Đang giao': return 'info'
      case 'Đang xử lý': return 'warning'
      case 'Đã hủy': return 'error'
      default: return 'default'
    }
  }

  const calculateSubtotal = () => {
    if (!orderData?.items) return 0
    return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + (orderData?.shipping || 0) - (orderData?.discount || 0)
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
              Đơn hàng #{orderData.id}
            </Typography>
          </Box>
          <Chip 
            label={orderData.status} 
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
                    {orderData.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Trạng thái:
                  </Typography>
                  <Chip 
                    label={orderData.status} 
                    color={getStatusColor(orderData.status)} 
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Thanh toán:
                  </Typography>
                  <Typography variant="body2">
                    {orderData.paymentMethod}
                  </Typography>
                </Box>
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
              </Box>
            </Paper>

            {/* Products List */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Sản phẩm ({orderData.items.length})
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
                  {orderData.items.map((item) => (
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
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatPrice(item.price)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatPrice(item.price * item.quantity)}
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
                    {orderData.customer}
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
                  <Typography>{formatPrice(orderData.shipping)}</Typography>
                </Box>
                {orderData.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Giảm giá:</Typography>
                    <Typography color="error">-{formatPrice(orderData.discount)}</Typography>
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
