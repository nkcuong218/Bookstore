import { Box, Paper, Typography, IconButton, Chip, TextField, InputAdornment, MenuItem, Select, FormControl } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import { formatPrice } from '../../utils/formatPrice'
import orderService from '../../apis/orderService'

const OrdersManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders({ page: 0, size: 200 })
      setOrders(response?.content || [])
    } catch {
      setOrders([])
    }
  }

  useEffect(() => {
    const handleFocus = () => {
      loadOrders()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const calculateOrderTotal = (order) => order.totalAmount || 0

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: 'Đang xử lý',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const filteredOrders = orders.filter(order => {
    const orderCode = (order.orderCode || '').toLowerCase()
    const customerName = (order.customerName || '').toLowerCase()
    const statusLabel = getStatusLabel(order.status)
    const matchesSearch = orderCode.includes(searchTerm.toLowerCase()) ||
                         customerName.includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || statusLabel === statusFilter
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
              )
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
                  <td style={{ padding: '12px', fontWeight: 600 }}>#{order.orderCode}</td>
                  <td style={{ padding: '12px' }}>{order.customerName}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{order.email}</td>
                  <td style={{ padding: '12px' }}>{(order.items || []).length} sản phẩm</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{formatPrice(calculateOrderTotal(order))}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip label={getStatusLabel(order.status)} color={getStatusColor(getStatusLabel(order.status))} size="small" />
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
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
