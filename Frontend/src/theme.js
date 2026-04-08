import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#3e5d58', // Bookstore Dark Green
          light: '#5a827b',
          dark: '#2d433f'
        },
        secondary: {
          main: '#e57373' // Accent color (Salmon/Red)
        },
        background: {
          default: '#f8f9fa',
          paper: '#ffffff'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#5a827b'
        },
        secondary: {
          main: '#ef5350'
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        }
      }
    }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.3px' },
    h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    body1: { fontFamily: '"Inter", sans-serif', lineHeight: 1.6 },
    body2: { fontFamily: '"Inter", sans-serif', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, fontFamily: '"Inter", sans-serif' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px'
        },
        body: {
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          lineHeight: 1.6,
          letterSpacing: '0.3px',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
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
          borderRadius: '4px'
        }
      }
    }
  }
})

export default theme