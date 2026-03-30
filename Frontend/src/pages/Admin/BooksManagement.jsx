import { Box, Paper, Typography, Button, IconButton, Chip, TextField, InputAdornment } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { formatPrice } from '../../utils/formatPrice'

const BooksManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [books, setBooks] = useState([])

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = JSON.parse(localStorage.getItem('adminBooks') || '[]')
    if (savedBooks.length === 0) {
      // Initialize with default data if empty
      const defaultBooks = [
        { id: 1, title: 'Cánh Rồng Thứ Tư', author: 'Rebecca Yarros', price: 420000, stock: 45, status: 'Còn hàng', isbn: '978-1649374042', pages: 498, publisher: 'Nhà xuất bản Trẻ', description: 'Một câu chuyện hấp dẫn về kỵ sĩ rồng...', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300' },
        { id: 2, title: 'Ngọn Lửa Thép', author: 'Rebecca Yarros', price: 450000, stock: 32, status: 'Còn hàng', isbn: '978-1649374172', pages: 623, publisher: 'Nhà xuất bản Trẻ', description: 'Phần tiếp theo của Cánh Rồng Thứ Tư...', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200&h=300' },
        { id: 3, title: 'Bệnh Nhân Im Lặng', author: 'Alex Michaelides', price: 299000, stock: 28, status: 'Còn hàng', isbn: '978-1250301697', pages: 336, publisher: 'Nhà xuất bản Văn học', description: 'Một câu chuyện trinh thám ly kỳ...', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&h=300' },
        { id: 4, title: 'Thói Quen Nguyên Tử', author: 'James Clear', price: 279000, stock: 67, status: 'Còn hàng', isbn: '978-0735211292', pages: 320, publisher: 'Nhà xuất bản Tổng hợp TP.HCM', description: 'Cách tạo thói quen tốt và phá vỡ thói quen xấu...', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=300' },
        { id: 5, title: 'Nhà Giả Kim', author: 'Paulo Coelho', price: 239000, stock: 12, status: 'Sắp hết', isbn: '978-0062315007', pages: 208, publisher: 'Nhà xuất bản Hội Nhà Văn', description: 'Hành trình tìm kiếm kho báu của một chàng chăn cừu...', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200&h=300' },
        { id: 6, title: 'Harry Potter', author: 'J.K. Rowling', price: 259000, stock: 0, status: 'Hết hàng', isbn: '978-0439708180', pages: 309, publisher: 'Nhà xuất bản Trẻ', description: 'Câu chuyện về cậu bé phù thủy...', coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&q=80&w=200&h=300' }
      ]
      localStorage.setItem('adminBooks', JSON.stringify(defaultBooks))
      setBooks(defaultBooks)
    } else {
      setBooks(savedBooks)
    }
  }, [])

  // Reload books when navigating back
  useEffect(() => {
    const handleFocus = () => {
      const savedBooks = JSON.parse(localStorage.getItem('adminBooks') || '[]')
      setBooks(savedBooks)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

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

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Bạn có chắc muốn xóa sách này?')) {
      const updatedBooks = books.filter(book => book.id !== bookId)
      localStorage.setItem('adminBooks', JSON.stringify(updatedBooks))
      setBooks(updatedBooks)
      alert('Xóa sách thành công!')
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
            ),
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
                    <Chip label={book.status} color={getStatusColor(book.status)} size="small" />
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
