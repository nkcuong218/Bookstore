import { Box, Paper, Typography, Button, Grid, Chip, TextField, MenuItem, Select, FormControl, InputLabel, Divider, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import { formatPrice } from '../../utils/formatPrice'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    // Load order from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]')
    const order = savedOrders.find(o => o.id === id)
    
    if (order) {
      setOrderData(order)
    } else {
      // Initialize default orders if not found
      initializeDefaultOrders()
    }
  }, [id])

  const initializeDefaultOrders = () => {
    const defaultOrders = [
      { 
        id: 'ORD001', 
        customer: 'Nguyễn Văn A', 
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
        status: 'Đang xử lý', 
        paymentMethod: 'COD',
        date: '29/03/2026',
        note: '',
        items: [
          { id: 1, name: 'Cánh Rồng Thứ Tư', price: 420000, quantity: 1, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 30000,
        discount: 0
      },
      { 
        id: 'ORD002', 
        customer: 'Trần Thị B', 
        email: 'tranthib@email.com',
        phone: '0912345678',
        address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        status: 'Đã giao', 
        paymentMethod: 'Chuyển khoản',
        date: '29/03/2026',
        note: 'Giao hàng buổi sáng',
        items: [
          { id: 2, name: 'Ngọn Lửa Thép', price: 450000, quantity: 1, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200&h=300' },
          { id: 3, name: 'Bệnh Nhân Im Lặng', price: 299000, quantity: 1, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 0,
        discount: 50000
      },
      { 
        id: 'ORD003', 
        customer: 'Lê Văn C', 
        email: 'levanc@email.com',
        phone: '0923456789',
        address: '789 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
        status: 'Đang giao', 
        paymentMethod: 'COD',
        date: '28/03/2026',
        note: '',
        items: [
          { id: 4, name: 'Thói Quen Nguyên Tử', price: 279000, quantity: 1, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 30000,
        discount: 0
      },
      { 
        id: 'ORD004', 
        customer: 'Phạm Thị D', 
        email: 'phamthid@email.com',
        phone: '0934567890',
        address: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
        status: 'Đã giao', 
        paymentMethod: 'Thẻ tín dụng',
        date: '28/03/2026',
        note: 'Để hàng ở bảo vệ',
        items: [
          { id: 5, name: 'Nhà Giả Kim', price: 239000, quantity: 2, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200&h=300' },
          { id: 1, name: 'Cánh Rồng Thứ Tư', price: 420000, quantity: 1, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 0,
        discount: 100000
      },
      { 
        id: 'ORD005', 
        customer: 'Hoàng Văn E', 
        email: 'hoangvane@email.com',
        phone: '0945678901',
        address: '654 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
        status: 'Đã hủy', 
        paymentMethod: 'COD',
        date: '27/03/2026',
        note: 'Khách yêu cầu hủy',
        items: [
          { id: 2, name: 'Ngọn Lửa Thép', price: 450000, quantity: 1, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 30000,
        discount: 0
      },
      { 
        id: 'ORD006', 
        customer: 'Vũ Thị F', 
        email: 'vuthif@email.com',
        phone: '0956789012',
        address: '987 Đường Phan Xích Long, Phú Nhuận, TP.HCM',
        status: 'Đang xử lý', 
        paymentMethod: 'Chuyển khoản',
        date: '27/03/2026',
        note: '',
        items: [
          { id: 3, name: 'Bệnh Nhân Im Lặng', price: 299000, quantity: 1, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&h=300' },
          { id: 4, name: 'Thói Quen Nguyên Tử', price: 279000, quantity: 1, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=300' }
        ],
        shipping: 30000,
        discount: 30000
      }
    ]
    
    localStorage.setItem('adminOrders', JSON.stringify(defaultOrders))
    const order = defaultOrders.find(o => o.id === id)
    setOrderData(order)
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

  const handleSave = () => {
    const savedOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]')
    const updatedOrders = savedOrders.map(order => 
      order.id === orderData.id ? orderData : order
    )
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders))
    setIsEditing(false)
    alert('Cập nhật đơn hàng thành công!')
    // Quay về trang quản lý đơn hàng
    navigate('/admin/orders')
  }

  const handleUpdateField = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }))
  }

  const handleRemoveItem = (itemId) => {
    if (orderData.items.length === 1) {
      alert('Đơn hàng phải có ít nhất 1 sản phẩm!')
      return
    }
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setOrderData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }))
    }
  }

  if (!orderData) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Đang tải...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/admin/orders')}
            variant="outlined"
          >
            Quay lại
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Chi tiết đơn hàng #{orderData.id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditing ? (
            <>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setIsEditing(false)
                  // Reload data
                  const savedOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]')
                  const order = savedOrders.find(o => o.id === id)
                  setOrderData(order)
                }}
              >
                Hủy
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
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
                  value={orderData.status}
                  onChange={(e) => handleUpdateField('status', e.target.value)}
                  disabled={!isEditing}
                >
                  <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                  <MenuItem value="Đang giao">Đang giao</MenuItem>
                  <MenuItem value="Đã giao">Đã giao</MenuItem>
                  <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phương thức thanh toán"
                  select
                  value={orderData.paymentMethod}
                  onChange={(e) => handleUpdateField('paymentMethod', e.target.value)}
                  disabled={!isEditing}
                >
                  <MenuItem value="COD">COD</MenuItem>
                  <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                  <MenuItem value="Thẻ tín dụng">Thẻ tín dụng</MenuItem>
                  <MenuItem value="Ví điện tử">Ví điện tử</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  multiline
                  rows={3}
                  value={orderData.note}
                  onChange={(e) => handleUpdateField('note', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nhập ghi chú cho đơn hàng..."
                />
              </Grid>
            </Grid>
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
                  {isEditing && <TableCell align="center">Xóa</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {orderData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                          <Button 
                            size="small" 
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Typography sx={{ minWidth: 30, textAlign: 'center' }}>{item.quantity}</Typography>
                          <Button 
                            size="small" 
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </Box>
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatPrice(item.price * item.quantity)}
                    </TableCell>
                    {isEditing && (
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
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
              Thông tin khách hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Tên khách hàng"
                value={orderData.customer}
                onChange={(e) => handleUpdateField('customer', e.target.value)}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Email"
                value={orderData.email}
                onChange={(e) => handleUpdateField('email', e.target.value)}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={orderData.phone}
                onChange={(e) => handleUpdateField('phone', e.target.value)}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Địa chỉ"
                multiline
                rows={3}
                value={orderData.address}
                onChange={(e) => handleUpdateField('address', e.target.value)}
                disabled={!isEditing}
              />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Phí vận chuyển:</Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    value={orderData.shipping}
                    onChange={(e) => handleUpdateField('shipping', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                ) : (
                  <Typography>{formatPrice(orderData.shipping)}</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Giảm giá:</Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    value={orderData.discount}
                    onChange={(e) => handleUpdateField('discount', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                ) : (
                  <Typography color="error">-{formatPrice(orderData.discount)}</Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                <Typography variant="body2">{orderData.date}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip 
                  label={orderData.status} 
                  color={getStatusColor(orderData.status)} 
                  size="small" 
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderDetail
