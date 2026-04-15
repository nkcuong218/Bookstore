import {
  Box, Container, Typography, Grid, Button, Divider, Rating, Chip, Paper, Breadcrumbs, Link, Avatar,
  Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CloseIcon from '@mui/icons-material/Close'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
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
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [isSampleOpen, setIsSampleOpen] = useState(false)
  const [sampleIndex, setSampleIndex] = useState(0)

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
          genre: detail.genres && detail.genres.length > 0 ? detail.genres[0] : undefined,
          page: 0,
          size: 12,
          sortBy: 'newest'
        })

        const rel = (listResponse?.content || [])
          .filter((b) => b.id !== detail.id)
          .slice(0, 5)
        setRelatedBooks(rel)

        setReviewsLoading(true)
        try {
          const reviewResponse = await bookService.getBookReviews(detail.id)
          setReviews(Array.isArray(reviewResponse) ? reviewResponse : [])
        } catch {
          setReviews([])
        } finally {
          setReviewsLoading(false)
        }
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
    
    // Kiểm tra số lượng không vượt quá stock
    if (quantity > book.stock) {
      alert(`Số lượng không được vượt quá ${book.stock} quyển trong kho!`)
      return
    }

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const foundItem = existingCart.find((item) => item.id === book.id)

    // Kiểm tra tổng số lượng (hiện tại + muốn thêm) không vượt quá stock
    const totalQuantity = (foundItem?.quantity || 0) + quantity
    if (totalQuantity > book.stock) {
      alert(`Tổng số lượng sách này trong giỏ không được vượt quá ${book.stock} quyển!`)
      return
    }

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
        <Typography variant="h4">Không tìm thấy sách</Typography>
        <Button variant="contained" onClick={() => navigate('/books')} sx={{ mt: 2 }}>
          Quay lại danh sách sách
        </Button>
      </Container>
    )
  }

  const samplePages = Array.isArray(book.samplePageUrls) ? book.samplePageUrls : []

  const handleQuantityChange = (action) => {
    if (action === 'increase' && quantity < book.stock) {
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
            Trang chủ
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/books')}
            sx={{ cursor: 'pointer' }}
          >
            Sách
          </Link>
          <Typography color="text.primary">{book.title}</Typography>
        </Breadcrumbs>

        {/* Main Content */}
        <Paper sx={{ p: 2.5, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Left: Book Image */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                position: 'sticky',
                top: 60,
                bgcolor: '#f0f0f0',
                borderRadius: 2,
                overflow: 'hidden',
                aspectRatio: '2/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 360,
                marginLeft: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
              {/* Genres Chips */}
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                {book.genres && book.genres.length > 0 ? (
                  book.genres.map((genre) => (
                    <Chip
                      key={genre}
                      label={genre}
                      color="primary"
                      size="small"
                    />
                  ))
                ) : (
                  <Chip
                    label="Chưa phân loại"
                    color="default"
                    size="small"
                  />
                )}
              </Box>

              {/* Title */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {book.title}
              </Typography>

              {/* Author */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tác giả: {book.author}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={book.rating} precision={0.1} readOnly />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {book.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({book.reviews?.toLocaleString()} lượt đánh giá)
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Price */}
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                {formatPrice(book.price)}
              </Typography>

              {/* Stock Status */}
              {book.inStock && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'success.main' }}>
                  <CheckCircleOutlineIcon />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Còn hàng - Số lượng: {book.stock} quyển
                  </Typography>
                </Box>
              )}
              {!book.inStock && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'error.main' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Hết hàng
                  </Typography>
                </Box>
              )}

              {/* Quantity Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Số lượng:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                  <Button
                    onClick={() => handleQuantityChange('decrease')}
                    sx={{ minWidth: 32, py: 0.5, fontSize: '0.9rem' }}
                  >
                    -
                  </Button>
                  <Typography sx={{ px: 2, py: 0.5, minWidth: 40, textAlign: 'center', fontSize: '0.9rem' }}>
                    {quantity}
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange('increase')}
                    sx={{ minWidth: 32, py: 0.5, fontSize: '0.9rem' }}
                  >
                    +
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={!book.inStock}
                  sx={{ flex: 1, fontSize: '0.95rem' }}
                >
                  {book.inStock ? 'THÊM VÀO GIỎ HÀNG' : 'HẾT HÀNG'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleToggleWishlist}
                  sx={{ minWidth: 50 }}
                >
                  {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </Button>
              </Box>

              {(samplePages.length > 0 || book.sampleUrl) && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AutoStoriesIcon />}
                    onClick={() => {
                      setSampleIndex(0)
                      setIsSampleOpen(true)
                    }}
                  >
                    Đọc thử
                  </Button>
                </Box>
              )}

              {/* Shipping Info */}
              <Box sx={{
                bgcolor: '#f5f5f5',
                p: 1.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5
              }}>
                <LocalShippingOutlinedIcon color="primary" />
                <Typography variant="body2">
                  <strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 800.000 VNĐ trở lên
                </Typography>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Book Information */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Giới thiệu sách
              </Typography>
              <Typography variant="body2" paragraph sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                {book.description}
              </Typography>

              {/* Product Details */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Thông tin sách
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Mã ISBN:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{book.isbn}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Số trang:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{book.pages}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nhà xuất bản:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{book.publisher}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Năm xuất bản:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{book.yearPublished || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Ngôn ngữ:</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{book.language}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              Có thể bạn cũng thích
            </Typography>
            <Grid container spacing={2}>
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

        {/* Reviews */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Đánh giá từ khách hàng
          </Typography>

          {reviewsLoading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Đang tải đánh giá...</Typography>
            </Paper>
          ) : reviews.length > 0 ? (
            <Grid container spacing={2}>
              {reviews.map((review) => (
                <Grid item xs={12} key={review.id}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                        {(review.userName || 'K').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {review.userName || 'Khách hàng'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                            </Typography>
                          </Box>
                          <Rating value={review.rating || 0} readOnly />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                          {review.comment}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">
                Sách này chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận của bạn.
              </Typography>
            </Paper>
          )}
        </Box>

        <Dialog
          open={isSampleOpen}
          onClose={() => setIsSampleOpen(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Đọc thử: {book.title}
            <IconButton onClick={() => setIsSampleOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, height: '80vh' }}>
            {samplePages.length > 0 ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111' }}>
                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b1b1b' }}>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    Trang {sampleIndex + 1} / {samplePages.length}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => setSampleIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={sampleIndex === 0}
                      sx={{ color: '#fff' }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setSampleIndex((prev) => Math.min(prev + 1, samplePages.length - 1))}
                      disabled={sampleIndex >= samplePages.length - 1}
                      sx={{ color: '#fff' }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                  <Box
                    component="img"
                    src={samplePages[sampleIndex]}
                    alt={`Sample page ${sampleIndex + 1}`}
                    sx={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 1,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.45)'
                    }}
                  />
                </Box>

                {samplePages.length > 1 && (
                  <Box sx={{ p: 1.5, bgcolor: '#1b1b1b', display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {samplePages.map((pageUrl, index) => (
                      <Box
                        key={`sample-thumb-${index}`}
                        component="img"
                        src={pageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setSampleIndex(index)}
                        sx={{
                          width: 56,
                          height: 78,
                          objectFit: 'cover',
                          borderRadius: 0.5,
                          cursor: 'pointer',
                          opacity: sampleIndex === index ? 1 : 0.6,
                          border: sampleIndex === index ? '2px solid #42a5f5' : '1px solid #666'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : book.sampleUrl ? (
              <iframe
                src={book.sampleUrl}
                title={`sample-${book.id}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Sách này chưa có file đọc thử.</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  )
}

export default BookDetail