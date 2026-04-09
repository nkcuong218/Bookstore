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
    fontFamily: 'Arial, sans-serif',
    h1: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    h2: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    h3: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    h4: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    h5: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    h6: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
    body1: { fontFamily: 'Arial, sans-serif', lineHeight: 1.55, fontWeight: 400 },
    body2: { fontFamily: 'Arial, sans-serif', lineHeight: 1.55, fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 500, fontFamily: 'Arial, sans-serif' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px'
        },
        body: {
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.55,
          letterSpacing: '0px',
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