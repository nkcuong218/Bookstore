import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import PinterestIcon from '@mui/icons-material/Pinterest'
import { mockFooterLinks } from '../../apis/mock-data-vn'

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.secondary', pt: 6, pb: 4, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {mockFooterLinks.map((section, index) => (
            <Grid item xs={12} sm={3} key={index}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {section.title}
              </Typography>
              {section.links.map((text) => (
                <Link href="#" color="inherit" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} key={text}>
                  {text}
                </Link>
              ))}
            </Grid>
          ))}
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              CONNECT WITH US
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit"><FacebookIcon /></IconButton>
              <IconButton color="inherit"><TwitterIcon /></IconButton>
              <IconButton color="inherit"><InstagramIcon /></IconButton>
              <IconButton color="inherit"><PinterestIcon /></IconButton>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 6, pt: 3, borderTop: '1px solid #eeeeee' }}>
          <Typography variant="body2">
            © 2024 Barnes & Noble Booksellers, Inc.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            <Link href="#" color="inherit" variant="body2">Terms of Use</Link>
            <Link href="#" color="inherit" variant="body2">Privacy Policy</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
