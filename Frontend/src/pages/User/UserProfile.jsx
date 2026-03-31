import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Avatar, Breadcrumbs, Link, Divider, IconButton, InputAdornment
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import userService from '../../apis/userService'
import orderService from '../../apis/orderService'

const UserProfile = () => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    address: '',
    ward: '',
    district: '',
    city: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await userService.getProfile()
        setCurrentUser(user)
        setFormData({
          username: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          fullName: user.fullName || '',
          address: user.address || '',
          ward: '',
          district: '',
          city: ''
        })
      } catch {
        navigate('/login')
      }
    }

    loadProfile()
  }, [navigate])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Validate
    if (!formData.username || !formData.email) {
      alert('Tên đăng nhập và email không được để trống!')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Email không hợp lệ!')
      return
    }

    // Phone validation (if provided)
    if (formData.phone) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.phone)) {
        alert('Số điện thoại không hợp lệ! (10 chữ số)')
        return
      }
    }

    try {
      const updatedUser = await userService.updateProfile({
        fullName: formData.fullName || formData.username,
        phone: formData.phone,
        address: formData.address
      })
      setCurrentUser(updatedUser)
      setIsEditing(false)
      alert('Cập nhật hồ sơ thành công!')
    } catch (error) {
      alert(error.message || 'Cập nhật hồ sơ thất bại!')
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    setFormData({
      username: currentUser.fullName || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      fullName: currentUser.fullName || '',
      address: currentUser.address || '',
      ward: '',
      district: '',
      city: ''
    })
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    // Check new password length
    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    // Check password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Xác nhận mật khẩu không khớp!')
      return
    }

    try {
      await userService.updateProfile({ password: passwordData.newPassword })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      alert('Đổi mật khẩu thành công!')
    } catch (error) {
      alert(error.message || 'Đổi mật khẩu thất bại!')
    }
  }

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsChangingPassword(false)
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, totalSpent: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const myOrders = await orderService.getMyOrders()
        const totalOrders = (myOrders || []).length
        const completedOrders = (myOrders || []).filter((o) => o.status === 'DELIVERED').length
        const totalSpent = (myOrders || []).reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        setStats({ totalOrders, completedOrders, totalSpent })
      } catch {
        setStats({ totalOrders: 0, completedOrders: 0, totalSpent: 0 })
      }
    }

    if (currentUser) {
      loadStats()
    }
  }, [currentUser])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  if (!currentUser) {
    return null
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
          <Typography color="text.primary">Hồ sơ của tôi</Typography>
        </Breadcrumbs>

        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Hồ sơ của tôi
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Profile Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {formData.username?.charAt(0).toUpperCase()}
                </Avatar>
                {isEditing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <CameraAltOutlinedIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {formData.fullName || formData.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formData.email}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Stats */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn hàng
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.completedOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã giao
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {formatPrice(stats.totalSpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng chi tiêu
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/my-orders')}
              >
                Xem đơn hàng
              </Button>
            </Paper>
          </Grid>

          {/* Right: Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Thông tin cá nhân
                </Typography>
                {!isEditing ? (
                  <Button variant="contained" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    required
                  />
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nguyễn Văn A"
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    required
                  />
                </Grid>

                {/* Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    placeholder="0901234567"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Address Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnOutlinedIcon color="primary" />
                    Địa chỉ
                  </Typography>
                </Grid>

                {/* Street Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Số nhà, tên đường"
                  />
                </Grid>

                {/* Ward */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phường/Xã"
                    value={formData.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>

                {/* District */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Quận/Huyện"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>

                {/* City */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Tỉnh/Thành phố"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    💡 Lưu ý: Thông tin này sẽ được sử dụng làm mặc định khi bạn đặt hàng.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Change Password Section */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOutlinedIcon color="primary" />
                  Đổi mật khẩu
                </Typography>
                {!isChangingPassword ? (
                  <Button variant="outlined" onClick={() => setIsChangingPassword(true)}>
                    Đổi mật khẩu
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={handleCancelPassword}>
                      Hủy
                    </Button>
                    <Button variant="contained" onClick={handleChangePassword}>
                      Lưu mật khẩu
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showPassword.current ? 'text' : 'password'}
                    label="Mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    disabled={!isChangingPassword}
                    required
                    InputProps={{
                      endAdornment: isChangingPassword && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => toggleShowPassword('current')}
                            edge="end"
                          >
                            {showPassword.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type={showPassword.new ? 'text' : 'password'}
                    label="Mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    disabled={!isChangingPassword}
                    required
                    helperText={isChangingPassword ? 'Ít nhất 6 ký tự' : ''}
                    InputProps={{
                      endAdornment: isChangingPassword && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => toggleShowPassword('new')}
                            edge="end"
                          >
                            {showPassword.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type={showPassword.confirm ? 'text' : 'password'}
                    label="Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    disabled={!isChangingPassword}
                    required
                    error={isChangingPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
                    helperText={
                      isChangingPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                        ? 'Mật khẩu không khớp'
                        : ''
                    }
                    InputProps={{
                      endAdornment: isChangingPassword && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => toggleShowPassword('confirm')}
                            edge="end"
                          >
                            {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              {isChangingPassword && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
                  <Typography variant="body2" color="warning.dark">
                    ⚠️ Lưu ý: Sau khi đổi mật khẩu, bạn sẽ cần sử dụng mật khẩu mới để đăng nhập lần sau.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default UserProfile
