import { Box, Paper, Typography, IconButton, Chip, TextField, InputAdornment, MenuItem, Select, FormControl } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import { formatPrice } from '../../utils/formatPrice'

const OrdersManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]')
    
    if (savedOrders.length === 0) {
      // Initialize default orders
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
      setOrders(defaultOrders)
    } else {
      setOrders(savedOrders)
    }
  }

  // Reload when component gets focus (after editing an order)
  useEffect(() => {
    const handleFocus = () => {
      loadOrders()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const calculateOrderTotal = (order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return subtotal + order.shipping - order.discount
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã giao': return 'success'
      case 'Đang giao': return 'info'
      case 'Đang xử lý': return 'warning'
      case 'Đã hủy': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Quản lý đơn hàng
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm kiếm theo mã đơn, khách hàng, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
              <MenuItem value="Đang giao">Đang giao</MenuItem>
              <MenuItem value="Đã giao">Đã giao</MenuItem>
              <MenuItem value="Đã hủy">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mã đơn</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khách hàng</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Sản phẩm</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tổng tiền</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Ngày đặt</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>#{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.customer}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{order.email}</td>
                  <td style={{ padding: '12px' }}>{order.items.length} sản phẩm</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{formatPrice(calculateOrderTotal(order))}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                  </td>
                  <td style={{ padding: '12px' }}>{order.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {filteredOrders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy đơn hàng nào
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default OrdersManagement
