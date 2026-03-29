import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'

const BookCard = ({ id, title, author, price, coverUrl }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/books/${id}`)
  }

  return (
    <Card sx={{ 
      maxWidth: 220, 
      boxShadow: 'none', 
      border: 'none',
      backgroundColor: 'transparent',
      transition: 'transform 0.2s',
      position: 'relative',
      cursor: 'pointer',
      '&:hover': { 
        transform: 'translateY(-4px)' 
      },
      '&:hover .quick-add-btn': {
        opacity: 1
      }
    }}>
      <Box 
        onClick={handleCardClick}
        sx={{ position: 'relative', overflow: 'hidden', mb: 1, borderRadius: '4px', bgcolor: '#f0f0f0', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {coverUrl ? (
          <CardMedia
            component="img"
            image={coverUrl}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Không có ảnh</Typography>
        )}
        <Button 
          className="quick-add-btn"
          variant="contained" 
          color="primary"
          onClick={(e) => {
            e.stopPropagation()
            // Handle quick add to cart
          }}
          sx={{ 
            position: 'absolute', 
            bottom: '10px', 
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0,
            transition: 'opacity 0.2s',
            width: '80%',
            boxShadow: 2
          }}
        >
          THÊM NHANH
        </Button>
      </Box>
      <CardContent 
        onClick={handleCardClick}
        sx={{ p: '0 !important', textAlign: 'center' }}
      >
        <Typography variant="subtitle1" component="div" sx={{ fontFamily: '"Georgia", serif', fontWeight: 'bold', lineHeight: 1.2, minHeight: '2.4em', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {author}
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold' }}>
          {typeof price === 'number' ? formatPrice(price) : price}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default BookCard
