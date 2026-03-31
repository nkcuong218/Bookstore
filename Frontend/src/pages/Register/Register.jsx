import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material'
import authService from '../../apis/authService'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    // Validate input
    if (!fullName || !password || !email || !phone || !confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }

    try {
      await authService.register({
        fullName,
        email,
        password,
        phone
      })

      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      authService.logout()
      navigate('/login')
    } catch (error) {
      alert(error.message || 'Đăng ký thất bại!')
    }
  }

  return (
    <Box sx={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      py: 6
    }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              textAlign: 'center',
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
                        Đăng Ký
          </Typography>

          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Họ và tên"
              variant="outlined"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Số điện thoại"
              type="tel"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
                            Đăng Ký
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
                        Đã có tài khoản?{' '}
            <Link
              to="/login"
              style={{
                color: '#e57373',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Đăng nhập ngay
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register