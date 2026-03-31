import { Box, Paper, Typography, Button, IconButton, Chip, TextField, InputAdornment } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { formatPrice } from '../../utils/formatPrice'
import bookService from '../../apis/bookService'

const BooksManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [books, setBooks] = useState([])

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      const response = await bookService.getBooks({ page: 0, size: 200, sortBy: 'newest' })
      setBooks(response?.content || [])
    } catch {
      setBooks([])
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
    case 'Còn hàng': return 'success'
    case 'Sắp hết': return 'warning'
    case 'Hết hàng': return 'error'
    default: return 'default'
    }
  }

  const getStockStatus = (stock) => {
    if (stock > 20) return 'Còn hàng'
    if (stock > 0) return 'Sắp hết'
    return 'Hết hàng'
  }

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Bạn có chắc muốn xóa sách này?')) {
      try {
        await bookService.deleteBook(bookId)
        await loadBooks()
        alert('Xóa sách thành công!')
      } catch (error) {
        alert(error.message || 'Xóa sách thất bại!')
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý sách
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/books/add')}
        >
          Thêm sách mới
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tên sách</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tác giả</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Giá</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tồn kho</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>#{book.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{book.title}</td>
                  <td style={{ padding: '12px' }}>{book.author}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{formatPrice(book.price)}</td>
                  <td style={{ padding: '12px' }}>{book.stock}</td>
                  <td style={{ padding: '12px' }}>
                    <Chip label={getStockStatus(book.stock)} color={getStatusColor(getStockStatus(book.stock))} size="small" />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/admin/books/edit/${book.id}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {filteredBooks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy sách nào
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default BooksManagement
