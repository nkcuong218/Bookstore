import { Box, Container, Typography, Grid, Chip, FormControl, Select, MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import BookCard from '../../components/BookCard/BookCard'
import bookService from '../../apis/bookService'

const ListBook = () => {
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)

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
          genre: selectedGenre === 'All' ? undefined : selectedGenre,
          page: 0,
          size: 100,
          sortBy: sortMap[sortBy] || 'newest'
        })

        const items = response?.content || []
        const finalItems = sortBy === 'title'
          ? [...items].sort((a, b) => a.title.localeCompare(b.title))
          : items

        setBooks(finalItems)
      } catch {
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [selectedGenre, sortBy])

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            All Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover our collection of {books.length} amazing books
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
              label="All"
              onClick={() => setSelectedGenre('All')}
              color={selectedGenre === 'All' ? 'primary' : 'default'}
              sx={{ fontWeight: selectedGenre === 'All' ? 'bold' : 'normal' }}
            />
            {genres.map((genre) => (
              <Chip
                key={genre}
                label={genre}
                onClick={() => setSelectedGenre(genre)}
                color={selectedGenre === genre ? 'primary' : 'default'}
                sx={{ fontWeight: selectedGenre === genre ? 'bold' : 'normal' }}
              />
            ))}
          </Box>

          {/* Sort Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Sort by:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
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
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={book.id}>
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
              No books found in this category
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default ListBook