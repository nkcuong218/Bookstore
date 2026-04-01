import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Typography
} from '@mui/material'
import authService from '../../apis/authService'
import discountCodeService from '../../apis/discountCodeService'

const SaveCouponSection = () => {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingCode, setSavingCode] = useState('')
  const [savedCodes, setSavedCodes] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const normalizeCode = (value) => String(value || '').trim().toUpperCase()

  const loadSavedCodes = useCallback(async () => {
    if (!authService.isAuthenticated('customer')) {
      setSavedCodes([])
      return
    }

    try {
      const myCodes = await discountCodeService.getMyCodes()
      const assignedCodes = (Array.isArray(myCodes) ? myCodes : [])
        .map((item) => normalizeCode(item?.code))
        .filter(Boolean)

      setSavedCodes(assignedCodes)
    } catch {
      setSavedCodes([])
    }
  }, [])

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true)
      const availableCodes = await discountCodeService.getAvailableCodes()

      const latestCodes = (Array.isArray(availableCodes) ? availableCodes : [])
        .slice()
        .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
        .slice(0, 5)

      setCoupons(latestCodes)
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoupons()
    loadSavedCodes()

    const handleAuthChanged = () => {
      loadSavedCodes()
    }

    const handleCouponSaved = () => {
      loadSavedCodes()
    }

    window.addEventListener('auth-changed', handleAuthChanged)
    window.addEventListener('coupon-saved', handleCouponSaved)

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged)
      window.removeEventListener('coupon-saved', handleCouponSaved)
    }
  }, [loadCoupons, loadSavedCodes])

  const handleSaveCode = async (couponCode) => {
    const normalizedCode = normalizeCode(couponCode)

    if (savedCodes.includes(normalizedCode)) {
      showSnackbar('Mã này đã được lưu hoặc đã sử dụng rồi', 'info')
      return
    }

    if (!authService.isAuthenticated('customer')) {
      showSnackbar('Vui lòng đăng nhập để lưu mã', 'warning')
      navigate('/login')
      return
    }

    try {
      setSavingCode(normalizedCode)
      await discountCodeService.saveMyCode(normalizedCode)
      setSavedCodes((prev) => (prev.includes(normalizedCode) ? prev : [...prev, normalizedCode]))
      showSnackbar(`Đã lưu mã ${normalizedCode} vào tài khoản`, 'success')
      window.dispatchEvent(new Event('coupon-saved'))
    } catch (error) {
      showSnackbar(error.message || 'Không thể lưu mã giảm giá', 'error')
    } finally {
      setSavingCode('')
    }
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f7fbf9 0%, #edf5f2 100%)',
        border: '1px solid #d7e6e1'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#264b45', mb: 0.75 }}>
            Mã giảm giá
          </Typography>
          <Typography sx={{ color: '#4b6a64', lineHeight: 1.7 }}>
            Chọn một mã bên dưới để lưu vào tài khoản. Mã đã lưu sẽ hiển thị ở trang thanh toán để bạn dùng sau.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {loading && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                <CircularProgress size={20} />
                <Typography color="text.secondary">Đang tải mã giảm giá...</Typography>
              </Box>
            </Grid>
          )}

          {!loading && coupons.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary">Hiện chưa có mã giảm giá mới nào.</Typography>
            </Grid>
          )}

          {coupons.map((coupon) => {
            const code = normalizeCode(coupon?.code)
            const isSaving = savingCode === code
            const isSaved = savedCodes.includes(code)
            const typeLabel = String(coupon?.type || '').toUpperCase() === 'PERCENT'
              ? `Giảm ${coupon?.value || 0}%`
              : `Giảm ${new Intl.NumberFormat('vi-VN').format(Number(coupon?.value || 0))} đ`

            return (
              <Grid item xs={12} sm={6} md={4} key={coupon.id || code}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: '100%',
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: '#fff',
                    borderColor: '#d7e6e1'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#223f3b' }}>
                        {code}
                      </Typography>
                      <Chip label={typeLabel} color="success" size="small" />
                    </Box>

                    <Typography sx={{ color: '#556b67', lineHeight: 1.6, minHeight: 48 }}>
                      {coupon?.description || 'Mã giảm giá mới nhất từ hệ thống'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        variant="outlined"
                        size="small"
                        label={`Đơn tối thiểu: ${new Intl.NumberFormat('vi-VN').format(Number(coupon?.minOrder || 0))} đ`}
                      />
                      {coupon?.expiresAt && (
                        <Chip
                          variant="outlined"
                          size="small"
                          label={`Hết hạn: ${new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}`}
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleSaveCode(code)}
                        disabled={isSaving || isSaved}
                        color={isSaved ? 'success' : 'primary'}
                      >
                        {isSaved ? 'Đã lưu' : (isSaving ? 'Đang lưu...' : 'Lưu mã này')}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default SaveCouponSection