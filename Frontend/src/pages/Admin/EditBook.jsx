import { Box, Paper, Typography, TextField, Button, Grid, Breadcrumbs, Link, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { styled } from '@mui/material/styles'
import bookService from '../../apis/bookService'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const EditBook = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [imagePreview, setImagePreview] = useState(null)
  const [samplePagePreviews, setSamplePagePreviews] = useState([])
  const [draggedSamplePageIndex, setDraggedSamplePageIndex] = useState(null)
  const [dragOverSamplePageIndex, setDragOverSamplePageIndex] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genresInput: '',
    price: '',
    stock: '',
    isbn: '',
    pages: '',
    publisher: '',
    yearPublished: '',
    description: '',
    coverUrl: '',
    sampleUrl: '',
    samplePageUrls: '',
    samplePageUploads: []
  })

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const book = await bookService.getBookById(id)
        setFormData({
          title: book.title || '',
          author: book.author || '',
          genresInput: (book.genres || []).join(', '),
          price: book.price || '',
          stock: book.stock || '',
          isbn: book.isbn || '',
          pages: book.pages || '',
          publisher: book.publisher || '',
          yearPublished: book.yearPublished || '',
          description: book.description || '',
          coverUrl: book.coverUrl || '',
          sampleUrl: book.sampleUrl || '',
          samplePageUrls: (book.samplePageUrls || []).join(', '),
          samplePageUploads: []
        })
        if (book.coverUrl) {
          setImagePreview(book.coverUrl)
        }
        setSamplePagePreviews(book.samplePageUrls || [])
      } catch {
        alert('Không tìm thấy sách!')
        navigate('/admin/books')
      }
    }

    fetchBook()
  }, [id, navigate])

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

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'))
    reader.readAsDataURL(file)
  })

  const handleSampleUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const hasInvalidType = files.some((file) => !file.type.startsWith('image/'))
    if (hasInvalidType) {
      alert('Vui lòng chọn file ảnh cho phần đọc thử!')
      return
    }

    const hasOversized = files.some((file) => file.size > 5 * 1024 * 1024)
    if (hasOversized) {
      alert('Mỗi ảnh đọc thử không được vượt quá 5MB!')
      return
    }

    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl))
      const urlItems = formData.samplePageUrls
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const uploadItems = samplePagePreviews.filter((item) => item.startsWith('data:'))
      const nextItems = [...urlItems, ...uploadItems, ...dataUrls].slice(0, 10)
      setSamplePagePreviews(nextItems)
    } catch {
      alert('Không thể tải ảnh đọc thử, vui lòng thử lại!')
    }
  }

  const syncSamplePageUrlField = (items) => {
    const urlItems = items.filter((item) => !item.startsWith('data:'))
    handleFormChange('samplePageUrls', urlItems.join(', '))
  }

  const removeSamplePage = (pageUrl) => {
    const nextItems = samplePagePreviews.filter((item) => item !== pageUrl)
    setSamplePagePreviews(nextItems)
    syncSamplePageUrlField(nextItems)
  }

  const moveSamplePage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return

    setSamplePagePreviews((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      syncSamplePageUrlField(next)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!formData.title || !formData.author || !formData.price || !formData.stock) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!')
      return
    }

    const payload = {
      title: formData.title,
      author: formData.author,
      genres: formData.genresInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      isbn: formData.isbn,
      pages: parseInt(formData.pages) || 0,
      publisher: formData.publisher,
      yearPublished: parseInt(formData.yearPublished) || null,
      description: formData.description,
      coverUrl: formData.coverUrl,
      sampleUrl: formData.sampleUrl,
      samplePageUrls: samplePagePreviews
    }

    try {
      await bookService.updateBook(id, payload)
      alert('Cập nhật sách thành công!')
      navigate('/admin/books')
    } catch (error) {
      alert(error.message || 'Cập nhật sách thất bại!')
    }
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
        <Typography color="text.primary">Chỉnh sửa sách</Typography>
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
          Chỉnh sửa sách
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
                    Tải ảnh mới
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

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 'bold' }}>
                Ảnh đọc thử (nhiều trang)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Tải ảnh trang đọc thử
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSampleUpload}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {samplePagePreviews.length > 0
                    ? `Đang có ${samplePagePreviews.length} ảnh trang đọc thử`
                    : 'Chưa có ảnh đọc thử'}
                </Typography>
              </Box>
              {samplePagePreviews.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {samplePagePreviews.map((url, index) => (
                    <Box
                      key={`sample-page-${index}`}
                      draggable
                      onDragStart={() => setDraggedSamplePageIndex(index)}
                      onDragEnd={() => {
                        setDraggedSamplePageIndex(null)
                        setDragOverSamplePageIndex(null)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        setDragOverSamplePageIndex(index)
                      }}
                      onDragLeave={() => {
                        if (dragOverSamplePageIndex === index) {
                          setDragOverSamplePageIndex(null)
                        }
                      }}
                      onDrop={() => {
                        if (draggedSamplePageIndex !== null) {
                          moveSamplePage(draggedSamplePageIndex, index)
                          setDraggedSamplePageIndex(null)
                        }
                        setDragOverSamplePageIndex(null)
                      }}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 110,
                        cursor: 'grab',
                        borderRadius: 1,
                        outline: dragOverSamplePageIndex === index
                          ? '2px dashed #1976d2'
                          : '2px solid transparent',
                        outlineOffset: 2,
                        transform: draggedSamplePageIndex === index ? 'scale(0.98)' : 'none',
                        opacity: draggedSamplePageIndex === index ? 0.85 : 1,
                        transition: 'outline 0.15s ease, transform 0.15s ease, opacity 0.15s ease'
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Sample page ${index + 1}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeSamplePage(url)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL ảnh đọc thử (tùy chọn, ngăn cách bằng dấu phẩy)"
                value={formData.samplePageUrls}
                onChange={(e) => {
                  handleFormChange('samplePageUrls', e.target.value)
                  const urls = e.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                  const uploadItems = samplePagePreviews.filter((item) => item.startsWith('data:'))
                  setSamplePagePreviews([...urls, ...uploadItems].slice(0, 10))
                }}
                placeholder="https://example.com/page-1.jpg, https://example.com/page-2.jpg"
                helperText="Có thể upload ảnh hoặc nhập nhiều URL ảnh trang đọc thử"
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
                label="Thể loại (nhiều thể loại)"
                value={formData.genresInput}
                onChange={(e) => handleFormChange('genresInput', e.target.value)}
                placeholder="Ví dụ: Technology, Business, Self-Help"
                helperText="Nhập nhiều thể loại, ngăn cách bằng dấu phẩy"
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm xuất bản"
                type="number"
                value={formData.yearPublished}
                onChange={(e) => handleFormChange('yearPublished', e.target.value)}
                placeholder="Ví dụ: 2024"
                inputProps={{ min: 1000, max: 2099 }}
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
              Cập nhật
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default EditBook
