import {
  Box, Container, Typography, Grid, Button, Divider, Rating, Chip, Paper, Breadcrumbs, Link
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import BookCard from '../../../components/BookCard/BookCard'
import { formatPrice } from '../../../utils/formatPrice'
import bookService from '../../../apis/bookService'
import authService from '../../../apis/authService'
import wishlistService from '../../../apis/wishlistService'

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [book, setBook] = useState(null)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true)
      try {
        const detail = await bookService.getBookById(id)
        setBook(detail)

        if (authService.isAuthenticated('customer')) {
          try {
            const containsResponse = await wishlistService.containsBook(detail.id)
            setIsFavorite(!!containsResponse?.exists)
          } catch {
            setIsFavorite(false)
          }
        } else {
          setIsFavorite(false)
        }

        const listResponse = await bookService.getBooks({
          genre: detail.genre,
          page: 0,
          size: 12,
          sortBy: 'newest'
        })

        const rel = (listResponse?.content || [])
          .filter((b) => b.id !== detail.id)
          .slice(0, 5)
        setRelatedBooks(rel)
      } catch {
        setBook(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBookData()
  }, [id])

  const handleToggleWishlist = async () => {
    if (!book) return

    if (!authService.isAuthenticated('customer')) {
      alert('Vui lòng đăng nhập để dùng wishlist!')
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        await wishlistService.removeFromWishlist(book.id)
        setIsFavorite(false)
        alert('Đã xóa khỏi danh sách yêu thích!')
      } else {
        await wishlistService.addToWishlist(book.id)
        setIsFavorite(true)
        alert('Đã thêm vào danh sách yêu thích!')
      }
    } catch (error) {
      alert(error.message || 'Không thể cập nhật wishlist')
    }
  }

  const handleAddToCart = () => {
    if (!book) return
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const foundItem = existingCart.find((item) => item.id === book.id)

    let nextCart
    if (foundItem) {
      nextCart = existingCart.map((item) =>
        item.id === book.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      nextCart = [
        ...existingCart,
        {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          coverUrl: book.coverUrl,
          quantity
        }
      ]
    }

    localStorage.setItem('cart', JSON.stringify(nextCart))
    window.dispatchEvent(new Event('cart-updated'))
    alert('Đã thêm sách vào giỏ hàng!')
  }

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Đang tải dữ liệu sách...</Typography>
      </Container>
    )
  }

  if (!book) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Book not found</Typography>
        <Button variant="contained" onClick={() => navigate('/books')} sx={{ mt: 2 }}>
          Back to Books
        </Button>
      </Container>
    )
  }

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1)
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/books')}
            sx={{ cursor: 'pointer' }}
          >
            Books
          </Link>
          <Typography color="text.primary">{book.title}</Typography>
        </Breadcrumbs>

        {/* Main Content */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Left: Book Image */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                position: 'sticky',
                top: 20,
                bgcolor: '#f0f0f0',
                borderRadius: 2,
                overflow: 'hidden',
                aspectRatio: '2/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            {/* Right: Book Details */}
            <Grid item xs={12} md={8}>
              {/* Genre Chip */}
              <Chip
                label={book.genre}
                color="primary"
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Title */}
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {book.title}
              </Typography>

              {/* Author */}
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                by {book.author}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating value={book.rating} precision={0.1} readOnly />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {book.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({book.reviews?.toLocaleString()} reviews)
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Price */}
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold', mb: 3 }}>
                {formatPrice(book.price)}
              </Typography>

              {/* Stock Status */}
              {book.inStock && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'success.main' }}>
                  <CheckCircleOutlineIcon />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    In Stock
                  </Typography>
                </Box>
              )}

              {/* Quantity Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Quantity:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                  <Button
                    onClick={() => handleQuantityChange('decrease')}
                    sx={{ minWidth: 40, py: 1 }}
                  >
                    -
                  </Button>
                  <Typography sx={{ px: 3, py: 1, minWidth: 50, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange('increase')}
                    sx={{ minWidth: 40, py: 1 }}
                  >
                    +
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  sx={{ flex: 1, py: 1.5, fontSize: '1.1rem' }}
                >
                  ADD TO CART
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleToggleWishlist}
                  sx={{ minWidth: 60 }}
                >
                  {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </Button>
              </Box>

              {/* Shipping Info */}
              <Box sx={{
                bgcolor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}>
                <LocalShippingOutlinedIcon color="primary" />
                <Typography variant="body2">
                  <strong>Free Shipping</strong> on orders over $40
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Book Information */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                About This Book
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                {book.description}
              </Typography>

              {/* Product Details */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">ISBN:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{book.isbn}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pages:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{book.pages}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Publisher:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{book.publisher}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Year Published:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{book.yearPublished || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Language:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{book.language}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              You May Also Like
            </Typography>
            <Grid container spacing={3}>
              {relatedBooks.map((relatedBook) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={relatedBook.id}>
                  <BookCard
                    id={relatedBook.id}
                    title={relatedBook.title}
                    author={relatedBook.author}
                    price={relatedBook.price}
                    coverUrl={relatedBook.coverUrl}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default BookDetail