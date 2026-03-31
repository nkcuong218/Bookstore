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
  { value: 'PENDING', label: '�ang x? l�' },
  { value: 'CONFIRMED', label: '�� x�c nh?n' },
  { value: 'SHIPPING', label: '�ang giao' },
  { value: 'DELIVERED', label: '�� giao' },
  { value: 'CANCELLED', label: '�� h?y' }
]

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [pendingStatus, setPendingStatus] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      try {
        const response = await orderService.getAllOrders({ page: 0, size: 500 })
        const orders = response?.content || []
        const found = orders.find((order) => String(order.id) === String(id))

        if (!found) {
          alert('Kh�ng t�m th?y don h�ng!')
          navigate('/admin/orders')
          return
        }

        setOrderData(found)
        setPendingStatus(found.status)
      } catch {
        alert('Kh�ng th? t?i chi ti?t don h�ng!')
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
      alert('C?p nh?t tr?ng th�i don h�ng th�nh c�ng!')
      navigate('/admin/orders')
    } catch (error) {
      alert(error.message || 'C?p nh?t tr?ng th�i th?t b?i!')
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          �ang t?i...
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
            Quay l?i
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Chi ti?t don h�ng #{orderData.orderCode}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditing ? (
            <>
              <Button variant="outlined" onClick={() => { setIsEditing(false); setPendingStatus(orderData.status) }}>
                H?y
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveStatus}>
                Luu tr?ng th�i
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              C?p nh?t tr?ng th�i
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Th�ng tin don h�ng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tr?ng th�i"
                  select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  disabled={!isEditing}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phuong th?c thanh to�n"
                  value={orderData.paymentMethod}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi ch�"
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
              S?n ph?m ({(orderData.items || []).length})
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S?n ph?m</TableCell>
                  <TableCell align="right">�on gi�</TableCell>
                  <TableCell align="center">S? lu?ng</TableCell>
                  <TableCell align="right">Th�nh ti?n</TableCell>
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
              Th�ng tin kh�ch h�ng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="T�n kh�ch h�ng" value={orderData.customerName} disabled />
              <TextField fullWidth label="Email" value={orderData.email} disabled />
              <TextField fullWidth label="S? di?n tho?i" value={orderData.phone} disabled />
              <TextField fullWidth label="�?a ch?" multiline rows={3} value={orderData.address} disabled />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              T?ng k?t don h�ng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>T?m t�nh:</Typography>
                <Typography>{formatPrice(calculateSubtotal())}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Ph� v?n chuy?n:</Typography>
                <Typography>{formatPrice(orderData.shippingFee || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Gi?m gi�:</Typography>
                <Typography color="error">-{formatPrice(orderData.discount || 0)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>T?ng c?ng:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatPrice(orderData.totalAmount || 0)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Ng�y d?t:</Typography>
                <Typography variant="body2">{new Date(orderData.createdAt).toLocaleDateString('vi-VN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Tr?ng th�i:</Typography>
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
