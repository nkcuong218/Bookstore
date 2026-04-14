import { Box, Container, Typography, Grid, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BookCard from '../../components/BookCard/BookCard'
import SaveCouponSection from '../../components/DiscountCode/SaveCouponSection'
import BannerCarousel from '../../components/Banner/BannerCarousel'
import bookService from '../../apis/bookService'
import genreService from '../../apis/genreService'

const defaultHomeSections = [{ id: 1, title: 'Sách bán chạy', disablePagination: true, topX: 10, columns: 5, rows: 2, dataSource: 'bestseller' }]
const defaultPaginationConfig = { homeGenresPerPage: 10, booksPerPage: 12 }

const BookSection = ({ section }) => {
  const [bookPage, setBookPage] = useState(1)
  const [booksState, setBooksState] = useState([])

  useEffect(() => {
    const fetchSectionData = async () => {
      let resData = []
      try {
        const source = section.dataSource || 'bestseller'
        if (source === 'bestseller') {
          resData = await bookService.getBestSellerBooks(section.topX || 10)
        } else if (source === 'newest') {
          // Lấy sách sắp xếp mới nhất
          const res = await bookService.getBooks({ size: section.topX || 10, sortBy: 'id,desc' })
          resData = res.content || res || []
        } else if (source === 'promotion') {
          // Tạm thời lấy sách featured cho phần Khuyến mại (sau này có API getSaleBooks thì thay)
          resData = await bookService.getFeaturedBooks()
        }
      } catch {
        resData = []
      }
      setBooksState(Array.isArray(resData) ? resData : [])
    }
    fetchSectionData()
  }, [section.dataSource, section.topX])

  const cols = section.columns || 5
  const rows = section.rows || 2

  // If sliding (pagination enabled), we show 1 row per page (cols items)
  // If static grid (pagination disabled), we show a static block of (cols * rows) items
  const booksPerPage = section.disablePagination ? (cols * rows) : cols

  const maxBooks = section.disablePagination ? (cols * rows) : (section.topX || 10)
  const displayBooks = booksState.slice(0, maxBooks)
  const totalBookPages = Math.ceil(displayBooks.length / booksPerPage)
  const visibleBooks = displayBooks.slice((bookPage - 1) * booksPerPage, bookPage * booksPerPage)

  return (
    <Container maxWidth="xl" sx={{ my: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, borderBottom: '2px solid #3e5d58', pb: 1 }}>
        <Typography variant="h4" color="primary.main">
          {section.title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {!section.disablePagination && (
          <IconButton
            onClick={() => setBookPage((prev) => (prev === 1 ? totalBookPages : prev - 1))}
            disabled={totalBookPages <= 1}
            size="large"
            sx={{ mr: 2 }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        <Grid
          container
          spacing={6}
          justifyContent={section.disablePagination ? 'flex-start' : 'center'}
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
          {(section.disablePagination ? displayBooks : visibleBooks).map((book, index) => {
            const rank = section.disablePagination ? index + 1 : (bookPage - 1) * booksPerPage + index + 1
            return (
              <Grid item key={book.id} sx={{ width: { xs: '100%', sm: '50%', md: `${100 / (section.columns || 5)}%` }, display: 'flex', justifyContent: 'center' }}>
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

        {!section.disablePagination && (
          <IconButton
            onClick={() => setBookPage((prev) => (prev === totalBookPages ? 1 : prev + 1))}
            disabled={totalBookPages <= 1}
            size="large"
            sx={{ ml: 2 }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
    </Container>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const [genres, setGenres] = useState([])
  const [genrePage, setGenrePage] = useState(0)
  const [paginationConfig, setPaginationConfig] = useState(defaultPaginationConfig)

  // HomePage sections config
  const [homeSections] = useState(() => {
    const saved = localStorage.getItem('homeSectionsConfig')
    if (saved) {
      try { return JSON.parse(saved) } catch { return defaultHomeSections }
    }
    return defaultHomeSections
  })

  useEffect(() => {
    const saved = localStorage.getItem('pagePaginationConfig')
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      setPaginationConfig({
        homeGenresPerPage: parsed.homeGenresPerPage || defaultPaginationConfig.homeGenresPerPage,
        booksPerPage: parsed.booksPerPage || defaultPaginationConfig.booksPerPage
      })
    } catch {
      setPaginationConfig(defaultPaginationConfig)
    }
  }, [])

  // Only genres for top row nav
  const genresPerPage = paginationConfig.homeGenresPerPage
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
    genreService.getGenres().then(res => setGenres(Array.isArray(res) ? res : [])).catch(() => {})
  }, [])

  // removed duplicate old pagination code

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

      {/* Dynamic Sections mapped from Admin Builder */}
      {homeSections.map((section) => (
        <BookSection key={section.id} section={section} />
      ))}
    </Box>
  )
}

export default HomePage
