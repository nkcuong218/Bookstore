import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material'
import authService from '../../apis/authService'

const Login = ({ portal = 'customer' }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const googleButtonRef = useRef(null)

  const authScope = portal === 'admin' || location.pathname.startsWith('/admin')
    ? 'admin'
    : 'customer'

  const handleAuthSuccess = (response, scope = authScope) => {
    const isAdminRole = authService.isAdminRole(response?.role)

    if (scope === 'admin') {
      if (!isAdminRole) {
        authService.logout('admin')
        alert('Tài khoản này không có quyền quản trị!')
        return
      }

      alert('Đăng nhập thành công!')
      navigate('/admin/dashboard')
      return
    }

    if (isAdminRole) {
      authService.logout('customer')
      authService.setSession(response, 'admin')
      alert('Đăng nhập thành công!')
      navigate('/admin/dashboard')
      return
    }

    alert('Đăng nhập thành công!')
    navigate('/')
  }

  useEffect(() => {
    if (authScope !== 'customer') return

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    let cancelled = false

    const renderGoogleButton = () => {
      if (cancelled) return

      const google = window.google
      if (!google?.accounts?.id || !googleButtonRef.current) {
        window.setTimeout(renderGoogleButton, 100)
        return
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (googleResponse) => {
          try {
            const response = await authService.loginWithGoogle(googleResponse?.credential)
            handleAuthSuccess(response, 'customer')
          } catch (error) {
            alert(error.message || 'Đăng nhập Google thất bại!')
          }
        }
      })

      googleButtonRef.current.innerHTML = ''
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320
      })
    }

    renderGoogleButton()

    return () => {
      cancelled = true
    }
  }, [authScope, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      const response = await authService.login({ email, password }, authScope)
      handleAuthSuccess(response)
    } catch (error) {
      alert(error.message || 'Đăng nhập thất bại!')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 6
      }}
    >
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
                        Đăng Nhập
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              label="Mật khẩu"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                            Đăng Nhập
            </Button>

            {authScope === 'customer' && (
              <Typography variant="body2" sx={{ textAlign: 'right', mt: -1 }}>
                <Link to="/forgot-password" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
                  Quên mật khẩu?
                </Link>
              </Typography>
            )}

            {authScope === 'customer' && (
              <>
                <Divider>hoặc</Divider>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box ref={googleButtonRef} />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Thiếu cấu hình Google Login (VITE_GOOGLE_CLIENT_ID).
                  </Typography>
                )}
              </>
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
                        Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{
                color: '#e57373',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
                            Đăng ký ngay
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login