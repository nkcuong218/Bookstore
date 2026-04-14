import { Box, Container, Typography, Grid, Chip, FormControl, Select, MenuItem, Pagination } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BookCard from '../../components/BookCard/BookCard'
import bookService from '../../apis/bookService'

const allLabel = 'Tất cả'

const ListBook = () => {
  const location = useLocation()
  const [selectedGenre, setSelectedGenre] = useState(allLabel)
  const [sortBy, setSortBy] = useState('featured')
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [booksPerPage, setBooksPerPage] = useState(12)
  const [booksColumns, setBooksColumns] = useState(4)

  useEffect(() => {
    const saved = localStorage.getItem('pagePaginationConfig')
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      const parsedColumns = Math.max(1, parseInt(parsed.booksColumns) || 4)
      const parsedRows = Math.max(1, parseInt(parsed.booksRows) || 3)
      const parsedTotal = Math.max(1, parseInt(parsed.booksPerPage) || parsedRows * parsedColumns)

      setBooksColumns(parsedColumns)
      setBooksPerPage(parsedTotal)
    } catch {
      setBooksColumns(4)
      setBooksPerPage(12)
    }
  }, [])

  const keyword = new URLSearchParams(location.search).get('keyword')?.trim() || ''
  const genreFromQuery = new URLSearchParams(location.search).get('genre')?.trim() || ''

  useEffect(() => {
    if (genreFromQuery) {
      setSelectedGenre(genreFromQuery)
    } else {
      setSelectedGenre(allLabel)
    }
    setCurrentPage(1)
  }, [genreFromQuery, keyword])

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await bookService.getGenres()
        setGenres(data || [])
      } catch {
        setGenres([])
      }
    }

    fetchGenres()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [booksPerPage])

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const sortMap = {
          featured: 'newest',
          'price-low': 'price_asc',
          'price-high': 'price_desc',
          title: 'newest'
        }

        const response = await bookService.getBooks({
          keyword: keyword || undefined,
          genre: selectedGenre === allLabel ? undefined : selectedGenre,
          page: currentPage - 1,
          size: booksPerPage,
          sortBy: sortMap[sortBy] || 'newest'
        })

        const items = response?.content || []
        const finalItems = sortBy === 'title'
          ? [...items].sort((a, b) => a.title.localeCompare(b.title))
          : items

        setBooks(finalItems)
        setTotalPages(response?.totalPages || 1)
        setTotalElements(response?.totalElements || items.length)
      } catch {
        setBooks([])
        setTotalPages(1)
        setTotalElements(0)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [selectedGenre, sortBy, keyword, currentPage, booksPerPage])

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            {keyword ? `Kết quả cho "${keyword}"` : 'Tất cả sách'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {keyword
              ? `Tìm thấy ${totalElements} sách phù hợp`
              : `Khám phá bộ sưu tập ${totalElements} cuốn sách tuyệt vời của chúng tôi`}
          </Typography>
        </Box>

        {/* Filters Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          bgcolor: 'white',
          p: 3,
          borderRadius: 2,
          boxShadow: 1
        }}>
          {/* Genre Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={allLabel}
              onClick={() => { setSelectedGenre(allLabel); setCurrentPage(1); }}
              color={selectedGenre === allLabel ? 'primary' : 'default'}
              sx={{ fontWeight: selectedGenre === allLabel ? 'bold' : 'normal' }}
            />
            {genres.map((genre) => (
              <Chip
                key={genre}
                label={genre}
                onClick={() => { setSelectedGenre(genre); setCurrentPage(1); }}
                color={selectedGenre === genre ? 'primary' : 'default'}
                sx={{ fontWeight: selectedGenre === genre ? 'bold' : 'normal' }}
              />
            ))}
          </Box>

          {/* Sort Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Sắp xếp theo:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              >
                <MenuItem value="featured">Nổi bật</MenuItem>
                <MenuItem value="title">Tên sách (A-Z)</MenuItem>
                <MenuItem value="price-low">Giá: Thấp đến cao</MenuItem>
                <MenuItem value="price-high">Giá: Cao đến thấp</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Books Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Đang tải danh sách sách...
            </Typography>
          </Box>
        ) : books.length > 0 ? (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item key={book.id} sx={{ width: { xs: '100%', sm: '50%', md: `${100 / booksColumns}%` } }}>
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  coverUrl={book.coverUrl}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy sách trong danh mục này
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, value) => setCurrentPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default ListBook