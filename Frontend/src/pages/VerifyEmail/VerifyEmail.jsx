import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Box, Container, Paper, Typography, Button, Alert, CircularProgress } from '@mui/material'
import authService from '../../apis/authService'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Thiếu mã xác thực!')
        setLoading(false)
        return
      }

      try {
        const response = await authService.verifyEmail(token)
        setMessage(response?.message || 'Xác thực tài khoản thành công!')
      } catch (err) {
        setError(err.message || 'Xác thực thất bại!')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
            Xác thực tài khoản
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <Button variant="contained" onClick={() => navigate('/login')}>
                Đi tới đăng nhập
              </Button>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Quay lại <Link to="/">trang chủ</Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default VerifyEmail
