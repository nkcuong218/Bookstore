import { Box, Paper, Typography, TextField, IconButton, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import reviewService from '../../apis/reviewService'

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await reviewService.getAdminReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return reviews.filter((review) => {
      const matchedKeyword =
        !keyword ||
        (review.userName || '').toLowerCase().includes(keyword) ||
        (review.bookTitle || '').toLowerCase().includes(keyword) ||
        (review.comment || '').toLowerCase().includes(keyword) ||
        (review.orderCode || '').toLowerCase().includes(keyword)

      const matchedRating = ratingFilter === 'all' || String(review.rating || '') === ratingFilter

      return matchedKeyword && matchedRating
    })
  }, [reviews, searchTerm, ratingFilter])

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return

    try {
      await reviewService.deleteAdminReview(id)
      await loadReviews()
      alert('Đã xóa đánh giá thành công!')
    } catch (error) {
      alert(error.message || 'Xóa đánh giá thất bại!')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý đánh giá khách hàng
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm theo khách hàng, sách, đơn hàng hoặc nội dung đánh giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Lọc theo số sao</InputLabel>
            <Select
              value={ratingFilter}
              label="Lọc theo số sao"
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="5">5 sao</MenuItem>
              <MenuItem value="4">4 sao</MenuItem>
              <MenuItem value="3">3 sao</MenuItem>
              <MenuItem value="2">2 sao</MenuItem>
              <MenuItem value="1">1 sao</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khách hàng</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Sách</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Đơn hàng</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Số sao</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Nội dung</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Ngày tạo</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{review.userName || 'Khách hàng'}</td>
                  <td style={{ padding: '12px' }}>{review.bookTitle || `#${review.bookId}`}</td>
                  <td style={{ padding: '12px' }}>{review.orderCode || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip
                      label={`${review.rating || 0} sao`}
                      color={(review.rating || 0) >= 4 ? 'success' : (review.rating || 0) === 3 ? 'warning' : 'error'}
                      size="small"
                    />
                  </td>
                  <td style={{ padding: '12px', maxWidth: 320, whiteSpace: 'pre-wrap' }}>{review.comment || ''}</td>
                  <td style={{ padding: '12px' }}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : ''}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <IconButton size="small" color="error" onClick={() => handleDeleteReview(review.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {!loading && filteredReviews.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không có đánh giá phù hợp
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ReviewsManagement
