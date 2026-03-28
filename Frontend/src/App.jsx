import { Box } from '@mui/material'
import Header from './components/Header/Header'
import HomePage from './pages/Home/HomePage'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        <HomePage />
      </Box>
      <Footer />
    </Box>
  )
}

export default App
