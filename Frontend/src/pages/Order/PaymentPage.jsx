import {
  Box, Container, Typography, Paper, Button,
  Alert, Chip, Divider, Stack, Snackbar
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { formatPrice } from '../../utils/formatPrice'
import { getBankTransferContent, hasBankTransferInfo, BANK_TRANSFER_INFO } from '../../utils/payment'

const PaymentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [copiedText, setCopiedText] = useState('')
  const [snackOpen, setSnackOpen] = useState(false)

  // Lấy dữ liệu từ navigation state
  const navState = location.state || {}
  const paymentInfo = navState.paymentInfo || null
  const orderId = navState.orderId || null

  // Nếu không có state hợp lệ thì redirect về my-orders
  useEffect(() => {
    if (!paymentInfo && !orderId) {
      navigate('/my-orders', { replace: true })
    }
  }, [paymentInfo, orderId, navigate])

  if (!paymentInfo && !orderId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Đang tải thông tin thanh toán...</Typography>
      </Box>
    )
  }

  // Đảm bảo các giá trị an toàn
  const orderCode   = String(paymentInfo?.orderCode || orderId || '')
  const amount      = Number(paymentInfo?.amount) || 0
  const rawQr       = paymentInfo?.qrCode || ''
  const checkoutUrl = paymentInfo?.checkoutUrl || ''
  const qrValue     = rawQr || checkoutUrl || ''
  const canShowQr   = qrValue.length >= 10 && qrValue.length <= 2000
  const isImageQr   = qrValue.startsWith('data:image') || qrValue.includes('qr.payos.vn')

  const transferContent = getBankTransferContent(orderCode)

  const handleCopy = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopiedText(label)
      setSnackOpen(true)
    }).catch(() => {})
  }

  return (
    <Box sx={{ bgcolor: '#f5f7ff', minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">

        {/* Tiêu đề */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label= "Đặt hàng thành công!"
            color="success"
            sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', px: 2.5, py: 3 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Thanh toán chuyển khoản
          </Typography>
          <Typography color="text.secondary">
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới để đơn hàng được xử lý
          </Typography>
        </Box>

        <Stack spacing={3}>

          {/* Thông tin đơn */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              THÔNG TIN ĐƠN HÀNG
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">Mã đơn hàng</Typography>
              <Typography variant="body2" fontWeight={700}>{orderCode || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">Số tiền cần chuyển</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">{formatPrice(amount)}</Typography>
            </Box>
          </Paper>

          {/* QR Code */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5, mb: 2 }}>
              QUÉT MÃ QR ĐỂ THANH TOÁN
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'flex-start' }}>
              {/* QR */}
              <Box sx={{ flexShrink: 0 }}>
                {canShowQr ? (
                  <Box sx={{
                    p: 2.5, bgcolor: '#fff', borderRadius: 3,
                    border: '2px solid #dbeafe', display: 'inline-block',
                    boxShadow: '0 4px 20px rgba(30,64,175,0.08)'
                  }}>
                    <img 
                      src={isImageQr ? qrValue : `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(qrValue)}`} 
                      alt="QR Code" 
                      style={{ width: 190, height: 190, objectFit: 'contain' }} 
                    />
                  </Box>
                ) : (
                  <Box sx={{
                    width: 220, height: 220, borderRadius: 3, bgcolor: '#f8fafc',
                    border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 1, p: 2
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Mã QR đang được tạo.<br />Vui lòng chuyển khoản thủ công hoặc mở link PayOS.
                    </Typography>
                  </Box>
                )}

                {checkoutUrl && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
                    sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Mở trang PayOS
                  </Button>
                )}
              </Box>

              {/* Hướng dẫn */}
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#475569' }}>
                  Hướng dẫn quét QR:
                </Typography>
                {[
                  'Mở app ngân hàng hoặc ví điện tử',
                  'Chọn "Quét mã QR" hoặc "Thanh toán QR"',
                  'Quét mã QR bên trái',
                  'Xác nhận số tiền và nội dung rồi thanh toán',
                ].map((step, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, mt: 0.1
                    }}>
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{step}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Chuyển khoản thủ công */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5, mb: 2 }}>
              CHUYỂN KHOẢN THỦ CÔNG
            </Typography>

            {hasBankTransferInfo ? (
              <Stack spacing={1.5}>
                {[
                  { label: 'Ngân hàng', value: BANK_TRANSFER_INFO.bankName, copy: false },
                  { label: 'Chủ tài khoản', value: BANK_TRANSFER_INFO.accountName, copy: true },
                  { label: 'Số tài khoản', value: BANK_TRANSFER_INFO.accountNumber, copy: true },
                  { label: 'Số tiền', value: formatPrice(amount), copy: true, rawValue: String(amount) },
                  { label: 'Nội dung CK', value: transferContent, copy: true },
                ].map(({ label, value, copy, rawValue }) => (
                  <Box key={label} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    py: 1, borderBottom: '1px solid #f1f5f9'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                      {label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right' }}>
                        {value}
                      </Typography>
                      {copy && (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<ContentCopyIcon sx={{ fontSize: '0.9rem !important' }} />}
                          onClick={() => handleCopy(rawValue || value, label)}
                          sx={{ minWidth: 'auto', px: 1, py: 0.3, fontSize: '0.75rem', textTransform: 'none' }}
                        >
                          Sao chép
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Thông tin tài khoản tĩnh chưa được cấu hình. Vui lòng quét mã QR hoặc mở link PayOS.
                </Alert>
                {[
                  { label: 'Mã đơn hàng', value: orderCode },
                  { label: 'Số tiền', value: formatPrice(amount) },
                  { label: 'Nội dung CK', value: transferContent },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    py: 1, borderBottom: '1px solid #f1f5f9'
                  }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{value}</Typography>
                      <Button
                        size="small" variant="text"
                        startIcon={<ContentCopyIcon sx={{ fontSize: '0.9rem !important' }} />}
                        onClick={() => handleCopy(value, label)}
                        sx={{ minWidth: 'auto', px: 1, py: 0.3, fontSize: '0.75rem', textTransform: 'none' }}
                      >
                        Sao chép
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Lưu ý */}
          <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>⚠️ Lưu ý quan trọng</Typography>
            <Typography variant="body2">
              • Chuyển khoản đúng <strong>số tiền</strong> và <strong>nội dung</strong> để đơn được xác nhận tự động<br />
              • Đơn sẽ được xử lý sau khi nhận được thanh toán (thường trong vài phút)<br />
              • Nếu cần hỗ trợ, liên hệ shop kèm mã đơn hàng <strong>#{orderCode}</strong>
            </Typography>
          </Alert>

          {/* Nút điều hướng */}
          <Divider />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', pb: 2 }}>
            <Button
              variant="outlined" size="large"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={() => navigate('/my-orders')}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, minWidth: 190 }}
            >
              Xem đơn hàng của tôi
            </Button>
            <Button
              variant="contained" size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/books')}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, minWidth: 190 }}
            >
              Tiếp tục mua sắm
            </Button>
          </Box>

        </Stack>
      </Container>

      {/* Snackbar sao chép */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 18 }} />
            {`Đã sao chép ${copiedText}`}
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default PaymentPage
