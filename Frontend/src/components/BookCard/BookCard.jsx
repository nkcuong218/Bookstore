import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material'

const BookCard = ({ title, author, price, coverUrl }) => {
  return (
    <Card sx={{ 
      maxWidth: 220, 
      boxShadow: 'none', 
      border: 'none',
      backgroundColor: 'transparent',
      transition: 'transform 0.2s',
      position: 'relative',
      '&:hover': { 
        transform: 'translateY(-4px)' 
      },
      '&:hover .quick-add-btn': {
        opacity: 1
      }
    }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', mb: 1, borderRadius: '4px', bgcolor: '#f0f0f0', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {coverUrl ? (
          <CardMedia
            component="img"
            image={coverUrl}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">No Cover</Typography>
        )}
        <Button 
          className="quick-add-btn"
          variant="contained" 
          color="primary"
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
          QUICK ADD
        </Button>
      </Box>
      <CardContent sx={{ p: '0 !important', textAlign: 'center' }}>
        <Typography variant="subtitle1" component="div" sx={{ fontFamily: '"Georgia", serif', fontWeight: 'bold', lineHeight: 1.2, minHeight: '2.4em', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {author}
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold' }}>
          {price}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default BookCard
