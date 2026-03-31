import { Box, Grid, Paper, Typography, Card, CardContent, CircularProgress } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useState, useEffect } from 'react'
import statsService from '../../apis/statsService'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await statsService.getDashboardStats()
        setData(result)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) return <Typography color="error">Không thể tải dữ liệu thống kê!</Typography>
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: data.totalRevenue || '0đ',
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      change: '+12.5%'
    },
    {
      title: 'Đơn hàng',
      value: data.totalOrders?.toLocaleString('vi-VN') || 0,
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      change: '+8.2%'
    },
    {
      title: 'Người dùng',
      value: data.totalUsers?.toLocaleString('vi-VN') || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      change: '+5.7%'
    },
    {
      title: 'Sách',
      value: data.totalBooks?.toLocaleString('vi-VN') || 0,
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      change: '+3.2%'
    }
  ]

  const recentOrders = data.recentOrders || []
  const topBooks = data.topBooks || []

  const getStatusColor = (status) => {
    switch (status) {
    case 'Đã giao': return 'success.main'
    case 'Đang giao': return 'info.main'
    case 'Đang xử lý': return 'warning.main'
    default: return 'text.secondary'
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Tổng quan
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {stat.change}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        so với tháng trước
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Đơn hàng gần đây
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mã đơn</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khách hàng</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tổng tiền</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{order.id}</td>
                      <td style={{ padding: '12px' }}>{order.customer}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{order.total}</td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" sx={{ color: getStatusColor(order.status), fontWeight: 600 }}>
                          {order.status}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* Top Books */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Sách bán chạy
            </Typography>
            <Box>
              {topBooks.map((book, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: index < topBooks.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {book.sold} đã bán
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {book.revenue}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
