import { Box, Container, Typography, Grid, Button, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BookCard from '../../components/BookCard/BookCard'
import SaveCouponSection from '../../components/DiscountCode/SaveCouponSection'
import BannerCarousel from '../../components/Banner/BannerCarousel'
import bookService from '../../apis/bookService'
import genreService from '../../apis/genreService'

const HomePage = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [genrePage, setGenrePage] = useState(0)
  const [bookPage, setBookPage] = useState(1)

  const genresPerPage = 10
  const totalGenrePages = Math.ceil((genres?.length || 0) / genresPerPage)
  const visibleGenres = genres.slice(genrePage * genresPerPage, (genrePage + 1) * genresPerPage)
  const canRotateGenres = totalGenrePages > 1

  const handlePrevGenrePage = () => {
    if (!canRotateGenres) return
    setGenrePage((prev) => (prev === 0 ? totalGenrePages - 1 : prev - 1))
  }

  const handleNextGenrePage = () => {
    if (!canRotateGenres) return
    setGenrePage((prev) => (prev === totalGenrePages - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    const fetchData = async () => {
      const [bestSellerBooksRes, featuredBooksRes, genresRes] = await Promise.allSettled([
        bookService.getBestSellerBooks(10),
        bookService.getFeaturedBooks(),
        genreService.getGenres()
      ])

      const booksSource = bestSellerBooksRes.status === 'fulfilled'
        ? bestSellerBooksRes.value
        : (featuredBooksRes.status === 'fulfilled' ? featuredBooksRes.value : [])

      setBooks(
        (booksSource || []).slice(0, 10)
      )
      setGenres(genresRes.status === 'fulfilled' ? (genresRes.value || []) : [])
    }

    fetchData()
  }, [])

  const booksPerPage = 5
  const totalBookPages = Math.ceil(books.length / booksPerPage)
  const visibleBooks = books.slice((bookPage - 1) * booksPerPage, bookPage * booksPerPage)

  return (
    <Box>
      <BannerCarousel />

      {/* Genres Row */}
      <Container maxWidth="xl" sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <IconButton
            onClick={handlePrevGenrePage}
            disabled={!canRotateGenres}
            size="large"
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {visibleGenres.map((genre) => (
            <Box
              key={genre.id || genre.name}
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: '#d5efe9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid #a9ddd1',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(15, 23, 42, 0.14)',
                  borderColor: '#7cbfb2'
                }
              }}
              onClick={() => navigate(`/books?genre=${encodeURIComponent(genre.name || '')}`)}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center', px: 1, color: '#1f5f56' }}>
                {genre.name || 'Khác'}
              </Typography>
            </Box>
          ))}
          </Box>

          <IconButton
            onClick={handleNextGenrePage}
            disabled={!canRotateGenres}
            size="large"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>

      {/* Coupon Save Section */}
      <Container maxWidth="xl" sx={{ my: 4 }}>
        <SaveCouponSection />
      </Container>

      {/* Bestsellers Section */}
      <Container maxWidth="xl" sx={{ my: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, borderBottom: '2px solid #3e5d58', pb: 1 }}>
          <Typography variant="h4" color="primary.main">
            Sách bán chạy
          </Typography>
          <Typography variant="body2" sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
            Xem tất cả &gt;
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <IconButton
            onClick={() => setBookPage((prev) => (prev === 1 ? totalBookPages : prev - 1))}
            disabled={totalBookPages <= 1}
            size="large"
            sx={{ mr: 2 }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Grid
            container
            spacing={6}
            justifyContent="center"
            key={bookPage}
            sx={{
              flexGrow: 1,
              animation: 'fadeInSlide 0.5s ease-out',
              '@keyframes fadeInSlide': {
                '0%': { opacity: 0, transform: 'translateX(15px)' },
                '100%': { opacity: 1, transform: 'translateX(0)' }
              }
            }}
          >
            {visibleBooks.map((book, index) => {
              const rank = (bookPage - 1) * booksPerPage + index + 1;
              return (
                <Grid item key={book.id}>
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    coverUrl={book.coverUrl}
                    rank={rank}
                  />
                </Grid>
              )
            })}
          </Grid>

          <IconButton
            onClick={() => setBookPage((prev) => (prev === totalBookPages ? 1 : prev + 1))}
            disabled={totalBookPages <= 1}
            size="large"
            sx={{ ml: 2 }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage
