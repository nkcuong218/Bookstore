import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Link,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import orderService from '../../apis/orderService'
import reviewService from '../../apis/reviewService'

const OrderReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [orderData, setOrderData] = useState(location.state?.order || null)
  const [reviews, setReviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadOrder = useCallback(async () => {
    if (orderData) return

    try {
      const order = await orderService.getOrderById(id)
      setOrderData(order)
    } catch {
      navigate('/my-orders')
    }
  }, [id, navigate, orderData])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  useEffect(() => {
    if (!orderData?.items?.length) return

    setReviews(orderData.items.map((item) => ({
      itemId: item.id,
      bookTitle: item.bookTitle,
      rating: 5,
      comment: ''
    })))
  }, [orderData])

  const updateReview = (itemId, key, value) => {
    setReviews((prev) => prev.map((review) => {
      if (review.itemId !== itemId) return review
      return { ...review, [key]: value }
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const hasInvalid = reviews.some((review) => !review.rating || review.comment.trim().length < 5)
    if (hasInvalid) {
      alert('Vui lòng cho điểm và nhập nhận xét tối thiểu 5 ký tự cho mỗi sản phẩm.')
      return
    }

    try {
      setIsSubmitting(true)

      await reviewService.submitOrderReviews(id, reviews.map((review) => ({
        itemId: review.itemId,
        rating: review.rating,
        comment: review.comment.trim()
      })))

      setSubmitSuccess(true)
      setTimeout(() => {
        navigate('/my-orders')
      }, 1200)
    } catch (error) {
      alert(error.message || 'Gửi đánh giá thất bại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!orderData) {
    return (
      <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
            Đang tải thông tin đơn hàng...
          </Typography>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Trang chủ
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/my-orders')}
            sx={{ cursor: 'pointer' }}
          >
            Đơn hàng của tôi
          </Link>
          <Typography color="text.primary">Đánh giá đơn hàng</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Đánh giá đơn hàng #{orderData.orderCode || orderData.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cảm ơn bạn đã mua hàng. Vui lòng để lại đánh giá cho các sản phẩm trong đơn.
          </Typography>
        </Paper>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Gửi đánh giá thành công. Đang quay lại trang đơn hàng của bạn...
          </Alert>
        )}

        <Stack spacing={2}>
          {reviews.map((review) => (
            <Paper key={review.itemId} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{review.bookTitle}</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Chấm điểm</Typography>
                <Rating
                  value={review.rating}
                  onChange={(event, value) => updateReview(review.itemId, 'rating', value || 0)}
                />
              </Box>
              <TextField
                label="Nhận xét"
                value={review.comment}
                onChange={(event) => updateReview(review.itemId, 'comment', event.target.value)}
                fullWidth
                multiline
                minRows={3}
                placeholder="Sản phẩm có đúng mô tả không? Chất lượng thế nào?"
              />
            </Paper>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(`/my-orders/${id}`)}>
            Quay lại đơn hàng
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting || submitSuccess}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default OrderReview
