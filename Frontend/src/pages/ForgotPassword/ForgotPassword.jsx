import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Paper, Typography, TextField, Button, Alert } from '@mui/material'
import authService from '../../apis/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email) {
      setError('Vui lòng nhập email!')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await authService.forgotPassword(email)
      setMessage(response?.message || 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.')
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu quên mật khẩu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
            Quên mật khẩu
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Quay lại <Link to="/login">đăng nhập</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default ForgotPassword
