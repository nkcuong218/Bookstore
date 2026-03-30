import { Box, Paper, Typography, TextField, Button, Grid, Breadcrumbs, Link } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { styled } from '@mui/material/styles'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

const AddBook = () => {
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    stock: '',
    isbn: '',
    pages: '',
    publisher: '',
    description: '',
    coverUrl: ''
  })

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        handleFormChange('coverUrl', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!formData.title || !formData.author || !formData.price || !formData.stock) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!')
      return
    }

    // Get existing books from localStorage or create new array
    const existingBooks = JSON.parse(localStorage.getItem('adminBooks') || '[]')
    
    const newBook = {
      id: existingBooks.length + 1,
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      pages: parseInt(formData.pages) || 0,
      status: parseInt(formData.stock) > 20 ? 'Còn hàng' : parseInt(formData.stock) > 0 ? 'Sắp hết' : 'Hết hàng',
      createdAt: new Date().toISOString()
    }

    existingBooks.push(newBook)
    localStorage.setItem('adminBooks', JSON.stringify(existingBooks))

    alert('Thêm sách thành công!')
    navigate('/admin/books')
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={() => navigate('/admin/books')}
          sx={{ cursor: 'pointer' }}
        >
          Quản lý sách
        </Link>
        <Typography color="text.primary">Thêm sách mới</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/books')}
          variant="outlined"
        >
          Quay lại
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Thêm sách mới
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Ảnh bìa sách
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'start' }}>
                {/* Preview */}
                <Box
                  sx={{
                    width: 200,
                    height: 300,
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    overflow: 'hidden'
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                      Chưa có ảnh
                    </Typography>
                  )}
                </Box>

                {/* Upload Button */}
                <Box>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Tải ảnh lên
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Hoặc nhập URL ảnh bên dưới
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    * Kích thước tối đa: 5MB
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    * Định dạng: JPG, PNG, GIF
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* URL Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL ảnh bìa (tùy chọn)"
                value={formData.coverUrl}
                onChange={(e) => {
                  handleFormChange('coverUrl', e.target.value)
                  if (e.target.value) {
                    setImagePreview(e.target.value)
                  }
                }}
                placeholder="https://example.com/book-cover.jpg"
                helperText="Nếu không upload ảnh, bạn có thể nhập URL ảnh trực tiếp"
              />
            </Grid>

            {/* Book Info Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
                Thông tin sách
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sách"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tác giả"
                value={formData.author}
                onChange={(e) => handleFormChange('author', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={(e) => handleFormChange('isbn', e.target.value)}
                placeholder="978-XXXXXXXXXX"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tồn kho"
                type="number"
                value={formData.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Số trang"
                type="number"
                value={formData.pages}
                onChange={(e) => handleFormChange('pages', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nhà xuất bản"
                value={formData.publisher}
                onChange={(e) => handleFormChange('publisher', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Nhập mô tả chi tiết về cuốn sách..."
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/books')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ minWidth: 150 }}
            >
              Thêm sách
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default AddBook
