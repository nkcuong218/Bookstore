import { Box, Paper, Typography, Button, IconButton, Chip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Khách hàng',
    status: 'Hoạt động'
  })

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('adminUsers')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Initialize default users
      const defaultUsers = [
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'Khách hàng', orders: 12, totalSpent: 3450000, status: 'Hoạt động', joinDate: '15/01/2026' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'Khách hàng', orders: 8, totalSpent: 2150000, status: 'Hoạt động', joinDate: '20/01/2026' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'Admin', orders: 0, totalSpent: 0, status: 'Hoạt động', joinDate: '01/01/2026' },
        { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', role: 'Khách hàng', orders: 25, totalSpent: 8900000, status: 'Hoạt động', joinDate: '10/12/2025' },
        { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', role: 'Khách hàng', orders: 5, totalSpent: 1200000, status: 'Bị khóa', joinDate: '05/02/2026' },
        { id: 6, name: 'Vũ Thị F', email: 'vuthif@email.com', role: 'Khách hàng', orders: 18, totalSpent: 5670000, status: 'Hoạt động', joinDate: '25/01/2026' }
      ]
      setUsers(defaultUsers)
      localStorage.setItem('adminUsers', JSON.stringify(defaultUsers))
    }
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role) => {
    return role === 'Admin' ? 'secondary' : 'default'
  }

  const getStatusColor = (status) => {
    return status === 'Hoạt động' ? 'success' : 'error'
  }

  const handleOpenAddDialog = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'Khách hàng',
      status: 'Hoạt động'
    })
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'Khách hàng',
      status: 'Hoạt động'
    })
  }

  const handleSaveUser = () => {
    if (!formData.name || !formData.email) {
      alert('Vui lòng nhập đầy đủ tên và email!')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Email không hợp lệ!')
      return
    }

    let updatedUsers
    if (editingUser) {
      // Edit existing user
      updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      )
      alert('Cập nhật người dùng thành công!')
    } else {
      // Add new user
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...formData,
        orders: 0,
        totalSpent: 0,
        joinDate: new Date().toLocaleDateString('vi-VN')
      }
      updatedUsers = [...users, newUser]
      alert('Thêm người dùng thành công!')
    }

    setUsers(updatedUsers)
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers))
    handleCloseDialog()
  }

  const handleToggleBlock = (user) => {
    const newStatus = user.status === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động'
    const action = newStatus === 'Bị khóa' ? 'khóa' : 'mở khóa'
    
    if (window.confirm(`Bạn có chắc muốn ${action} người dùng "${user.name}"?`)) {
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, status: newStatus } : u
      )
      setUsers(updatedUsers)
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers))
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công!`)
    }
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác!`)) {
      const updatedUsers = users.filter(u => u.id !== user.id)
      setUsers(updatedUsers)
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers))
      alert('Xóa người dùng thành công!')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý người dùng
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
          Thêm người dùng
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tên</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Vai trò</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Đơn hàng</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tổng chi</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Ngày tham gia</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>#{user.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </td>
                  <td style={{ padding: '12px' }}>{user.orders}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{formatPrice(user.totalSpent)}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                  </td>
                  <td style={{ padding: '12px' }}>{user.joinDate}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenEditDialog(user)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color={user.status === 'Hoạt động' ? 'warning' : 'success'}
                      onClick={() => handleToggleBlock(user)}
                      title={user.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {user.status === 'Hoạt động' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user)}
                      title="Xóa người dùng"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy người dùng nào
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên người dùng"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Vai trò"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="Khách hàng">Khách hàng</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Hoạt động">Hoạt động</MenuItem>
                <MenuItem value="Bị khóa">Bị khóa</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {editingUser ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersManagement
