import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#3e5d58', // Bookstore Dark Green
          light: '#5a827b',
          dark: '#2d433f',
        },
        secondary: {
          main: '#e57373', // Accent color (Salmon/Red)
        },
        background: {
          default: '#f8f9fa',
          paper: '#ffffff',
        },
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#5a827b',
        },
        secondary: {
          main: '#ef5350',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      }
    }
  },
  typography: {
    fontFamily: '"Lato", "Arial", sans-serif',
    h1: { fontFamily: '"Georgia", serif' },
    h2: { fontFamily: '"Georgia", serif' },
    h3: { fontFamily: '"Georgia", serif' },
    h4: { fontFamily: '"Georgia", serif' },
    h5: { fontFamily: '"Georgia", serif' },
    h6: { fontFamily: '"Georgia", serif' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#3e5d58',
            borderRadius: '8px'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        }
      }
    }
  }
})

export default theme