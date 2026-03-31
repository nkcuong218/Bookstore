import {
  Box, Paper, Typography, Button, IconButton, Chip,
  TextField, InputAdornment, Grid, Avatar, Tooltip
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PeopleIcon from '@mui/icons-material/People'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LockIcon from '@mui/icons-material/Lock'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { formatPrice } from '../../utils/formatPrice'
import userService from '../../apis/userService'

const UsersManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers({ page: 0, size: 200 })
      const mappedUsers = (response?.content || []).map((u) => ({
        ...u,
        name: u.fullName,
        roleLabel: u.role === 'admin' ? 'Admin' : 'Khách hàng',
        statusLabel: u.status === 'active' ? 'Hoạt động' : 'Bị khóa',
        orders: 0,
        totalSpent: 0
      }))
      setUsers(mappedUsers)
    } catch {
      setUsers([])
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Stats
  const totalUsers = users.length
  const adminCount = users.filter(u => u.roleLabel === 'Admin').length
  const lockedCount = users.filter(u => u.statusLabel === 'Bị khóa').length
  const newThisMonth = users.filter(u => {
    if (!u.joinDate) return false
    const joinDate = new Date(u.joinDate)
    return joinDate.getMonth() === new Date().getMonth() && joinDate.getFullYear() === new Date().getFullYear()
  }).length

  const getAvatarColor = (name) => {
    const colors = ['#3e5d58', '#e57373', '#7986cb', '#4db6ac', '#ff8a65', '#a1887f']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
  }


  const handleToggleBlock = (user) => {
    const newStatus = user.statusLabel === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động'
    const action = newStatus === 'Bị khóa' ? 'khóa' : 'mở khóa'
    if (window.confirm(`Bạn có chắc muốn ${action} người dùng "${user.name}"?`)) {
      userService.toggleUserStatus(user.id)
        .then(loadUsers)
        .catch((error) => alert(error.message || 'Không thể cập nhật trạng thái người dùng!'))
    }
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác!`)) {
      userService.deleteUser(user.id)
        .then(loadUsers)
        .catch((error) => alert(error.message || 'Không thể xóa người dùng!'))
    }
  }

  const StatCard = ({ icon, label, value, color }) => (
    <Paper sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: 2,
        bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
      </Box>
    </Paper>
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Quản lý người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý tài khoản và quyền truy cập của người dùng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/admin/users/add')}
          sx={{ px: 3, py: 1.2, fontWeight: 600 }}
        >
          Thêm người dùng
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PeopleIcon />} label="Tổng người dùng" value={totalUsers} color="#3e5d58" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<AdminPanelSettingsIcon />} label="Quản trị viên" value={adminCount} color="#7986cb" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<LockIcon />} label="Bị khóa" value={lockedCount} color="#e57373" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PersonAddIcon />} label="Mới tháng này" value={newThisMonth} color="#4db6ac" />
        </Grid>
      </Grid>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Danh sách người dùng
            <Chip label={filteredUsers.length} size="small" sx={{ ml: 1, fontWeight: 600 }} color="primary" />
          </Typography>
          <TextField
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                {['Người dùng', 'Email', 'Vai trò', 'Đơn hàng', 'Tổng chi', 'Trạng thái', 'Ngày tham gia', 'Thao tác'].map(col => (
                  <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.82rem', color: '#555', whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderTop: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Người dùng */}
                  <td style={{ padding: '14px 16px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(user.name), fontSize: '0.8rem', fontWeight: 700 }}>
                        {getInitials(user.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">#{user.id}</Typography>
                      </Box>
                    </Box>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '14px 16px', color: '#666', fontSize: '0.875rem' }}>{user.email}</td>

                  {/* Vai trò */}
                  <td style={{ padding: '14px 16px' }}>
                    <Chip
                      label={user.roleLabel}
                      size="small"
                      color={user.roleLabel === 'Admin' ? 'secondary' : 'default'}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </td>

                  {/* Đơn hàng */}
                  <td style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'center' }}>{user.orders}</td>

                  {/* Tổng chi */}
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#3e5d58', whiteSpace: 'nowrap' }}>
                    {formatPrice(user.totalSpent)}
                  </td>

                  {/* Trạng thái */}
                  <td style={{ padding: '14px 16px' }}>
                    <Chip
                      label={user.statusLabel}
                      size="small"
                      color={user.statusLabel === 'Hoạt động' ? 'success' : 'error'}
                      variant={user.statusLabel === 'Hoạt động' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </td>

                  {/* Ngày tham gia */}
                  <td style={{ padding: '14px 16px', color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{user.joinDate}</td>

                  {/* Thao tác */}
                  <td style={{ padding: '14px 16px' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/admin/users/edit/${user.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.statusLabel === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        <IconButton
                          size="small"
                          color={user.statusLabel === 'Hoạt động' ? 'warning' : 'success'}
                          onClick={() => handleToggleBlock(user)}
                        >
                          {user.statusLabel === 'Hoạt động' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa người dùng">
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PeopleIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Không tìm thấy người dùng nào
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default UsersManagement
