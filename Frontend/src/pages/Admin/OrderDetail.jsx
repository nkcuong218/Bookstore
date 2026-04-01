import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Đang xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'RECEIVED', label: 'Đã nhận hàng' },
  { value: 'CANCELLED', label: 'Đã hủy' }
]

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [pendingStatus, setPendingStatus] = useState('')

  const isStatusLocked = orderData?.status === 'RECEIVED'

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      try {
        const response = await orderService.getAllOrders({ page: 0, size: 500 })
        const orders = response?.content || []
        const found = orders.find((order) => String(order.id) === String(id))

        if (!found) {
          alert('Không tìm thấy đơn hàng!')
          navigate('/admin/orders')
          return
        }

        setOrderData(found)
        setPendingStatus(found.status)
      } catch {
        alert('Không thể tải chi tiết đơn hàng!')
        navigate('/admin/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id, navigate])

  const getStatusColor = (status) => {
    switch (status) {
    case 'DELIVERED':
      return 'success'
    case 'SHIPPING':
    case 'CONFIRMED':
      return 'info'
    case 'PENDING':
      return 'warning'
    case 'CANCELLED':
      return 'error'
    default:
      return 'default'
    }
  }

  const getStatusLabel = (status) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.label || status
  }

  const calculateSubtotal = () => {
    if (!orderData?.items) return 0
    return orderData.items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0)
  }

  const handleSaveStatus = async () => {
    try {
      const updated = await orderService.updateOrderStatus(orderData.id, pendingStatus)
      setOrderData(updated)
      setPendingStatus(updated.status)
      setIsEditing(false)
      alert('Cập nhật trạng thái đơn hàng thành công!')
      navigate('/admin/orders')
    } catch (error) {
      alert(error.message || 'Cập nhật trạng thái thất bại!')
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Đang tải...
        </Typography>
      </Box>
    )
  }

  if (!orderData) return null

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orders')} variant="outlined">
            Quay lại
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Chi tiết đơn hàng #{orderData.orderCode}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditing ? (
            <>
              <Button variant="outlined" onClick={() => { setIsEditing(false); setPendingStatus(orderData.status) }}>
                Hủy
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveStatus} disabled={isStatusLocked}>
                Lưu trạng thái
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)} disabled={isStatusLocked}>
              Cập nhật trạng thái
            </Button>
          )}
        </Box>
      </Box>

      {isStatusLocked && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Typography variant="body2" sx={{ color: '#237804', fontWeight: 600 }}>
            Đơn hàng đã được khách xác nhận nhận hàng. Trạng thái đã được khóa và không thể chỉnh sửa nữa.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Thông tin đơn hàng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trạng thái"
                  select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  disabled={!isEditing || isStatusLocked}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phương thức thanh toán"
                  value={orderData.paymentMethod}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  multiline
                  rows={3}
                  value={orderData.note || ''}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Sản phẩm ({(orderData.items || []).length})
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
                {(orderData.items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <img
                          src={item.bookCoverUrl}
                          alt={item.bookTitle}
                          style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.bookTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.bookAuthor}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatPrice(item.subtotal || item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Thông tin khách hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="Tên khách hàng" value={orderData.customerName} disabled />
              <TextField fullWidth label="Email" value={orderData.email} disabled />
              <TextField fullWidth label="Số điện thoại" value={orderData.phone} disabled />
              <TextField fullWidth label="Địa chỉ" multiline rows={3} value={orderData.address} disabled />
            </Box>
          </Paper>

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Giảm giá:</Typography>
                <Typography color="error">-{formatPrice(orderData.discount || 0)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatPrice(orderData.totalAmount || 0)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                <Typography variant="body2">{new Date(orderData.createdAt).toLocaleDateString('vi-VN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip label={getStatusLabel(orderData.status)} color={getStatusColor(orderData.status)} size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderDetail
