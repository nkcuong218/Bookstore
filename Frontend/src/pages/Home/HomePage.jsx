import { Box, Container, Typography, Grid, Button } from '@mui/material'
import BookCard from '../../components/BookCard/BookCard'

import { mockBooks, mockGenres } from '../../apis/mock-data-vn'

const HomePage = () => {
  return (
    <Box>
      {/* Hero Banner */}
      <Box sx={{ 
        bgcolor: 'primary.light', 
        color: 'white', 
        py: 12, 
        textAlign: 'center',
        backgroundImage: 'linear-gradient(135deg, #3e5d58 0%, #7ca19a 100%)'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ mb: 2, fontStyle: 'italic' }}>
            The Books Everyone is Talking About
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 'normal', opacity: 0.9 }}>
            Discover the most anticipated new releases and bestsellers of the season.
          </Typography>
          <Button variant="contained" color="secondary" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
            SHOP NOW
          </Button>
        </Container>
      </Box>

      {/* Genres Row */}
      <Container maxWidth="xl" sx={{ my: 6 }}>
        <Grid container spacing={2} justifyContent="center">
          {mockGenres.map((genre) => (
            <Grid item key={genre}>
              <Box sx={{ 
                width: 100, height: 100, 
                borderRadius: '50%', 
                bgcolor: '#f5f5f5', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                transition: '0.2s',
                '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {genre}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bestsellers Section */}
      <Container maxWidth="xl" sx={{ my: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, borderBottom: '2px solid #3e5d58', pb: 1 }}>
          <Typography variant="h4" color="primary.main">
            Bestsellers
          </Typography>
          <Typography variant="body2" sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
            See All &gt;
          </Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center">
          {mockBooks.map((book) => (
            <Grid item key={book.id}>
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
      </Container>
    </Box>
  )
}

export default HomePage
