import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Box, Container, Paper, Typography, TextField, Button, Alert } from '@mui/material'
import authService from '../../apis/authService'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      setError('Thiếu token đặt lại mật khẩu!')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await authService.resetPassword({ token, newPassword })
      setMessage(response?.message || 'Đặt lại mật khẩu thành công!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
            Đặt lại mật khẩu
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
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

export default ResetPassword
