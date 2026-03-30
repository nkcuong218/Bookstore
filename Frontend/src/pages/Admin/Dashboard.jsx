import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import MenuBookIcon from '@mui/icons-material/MenuBook'

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '125.500.000đ',
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      change: '+12.5%'
    },
    {
      title: 'Đơn hàng',
      value: '248',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      change: '+8.2%'
    },
    {
      title: 'Người dùng',
      value: '1,234',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      change: '+5.7%'
    },
    {
      title: 'Sách',
      value: '856',
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      change: '+3.2%'
    }
  ]

  const recentOrders = [
    { id: '#ORD001', customer: 'Nguyễn Văn A', total: '420.000đ', status: 'Đang xử lý', date: '29/03/2026' },
    { id: '#ORD002', customer: 'Trần Thị B', total: '650.000đ', status: 'Đã giao', date: '29/03/2026' },
    { id: '#ORD003', customer: 'Lê Văn C', total: '320.000đ', status: 'Đang giao', date: '28/03/2026' },
    { id: '#ORD004', customer: 'Phạm Thị D', total: '890.000đ', status: 'Đã giao', date: '28/03/2026' },
    { id: '#ORD005', customer: 'Hoàng Văn E', total: '450.000đ', status: 'Đang xử lý', date: '27/03/2026' }
  ]

  const topBooks = [
    { title: 'Cánh Rồng Thứ Tư', sold: 145, revenue: '60.900.000đ' },
    { title: 'Thói Quen Nguyên Tử', sold: 132, revenue: '36.828.000đ' },
    { title: 'Nhà Giả Kim', sold: 98, revenue: '23.422.000đ' },
    { title: 'Harry Potter', sold: 87, revenue: '22.533.000đ' },
    { title: 'Đấu Trường Sinh Tử', sold: 76, revenue: '22.724.000đ' }
  ]

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
