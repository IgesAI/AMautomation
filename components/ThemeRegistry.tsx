'use client'

import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff', // Cyan (matching portal)
      light: '#6effff',
      dark: '#00b2cc',
    },
    secondary: {
      main: '#ff00ff', // Magenta
      light: '#ff33ff',
      dark: '#cc00cc',
    },
    background: {
      default: '#0a0a0a',
      paper: '#0a0a0a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ff4444',
    },
    warning: {
      main: '#ffaa00',
    },
    success: {
      main: '#00ff00',
    },
    info: {
      main: '#0088ff',
    },
  },
  typography: {
    fontFamily: '"Share Tech Mono", "VT323", monospace',
    h1: {
      fontFamily: '"VT323", monospace',
      fontSize: '3rem',
      textShadow: '0 0 10px #00e5ff',
      letterSpacing: '0.1em',
    },
    h2: {
      fontFamily: '"VT323", monospace',
      fontSize: '2.5rem',
      textShadow: '0 0 8px #00e5ff',
      letterSpacing: '0.1em',
    },
    h3: {
      fontFamily: '"VT323", monospace',
      fontSize: '2rem',
      textShadow: '0 0 6px #00e5ff',
      letterSpacing: '0.08em',
    },
    h4: {
      fontFamily: '"VT323", monospace',
      fontSize: '1.75rem',
      textShadow: '0 0 5px #00e5ff',
      letterSpacing: '0.08em',
    },
    h5: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '1.5rem',
      textShadow: '0 0 4px #00e5ff',
      letterSpacing: '0.06em',
    },
    h6: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '1.25rem',
      textShadow: '0 0 3px #00e5ff',
      letterSpacing: '0.06em',
    },
    body1: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Share Tech Mono", monospace',
      textTransform: 'none',
      letterSpacing: '0.05em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#001122',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#00e5ff',
            borderRadius: '4px',
            '&:hover': {
              background: '#6effff',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid #00e5ff',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)',
            borderColor: '#6effff',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: '1px solid #00e5ff',
          borderRadius: '2px',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          textShadow: '0 0 5px #00e5ff',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            borderColor: '#6effff',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            textShadow: '0 0 8px #6effff',
          },
          '&:active': {
            boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.8)',
          },
        },
        contained: {
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            border: '1px solid #00cccc',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(0, 255, 255, 0.2)',
            '&:hover': {
              borderColor: '#00e5ff',
              boxShadow: '0 0 12px rgba(0, 255, 255, 0.3)',
            },
            '&.Mui-focused': {
              borderColor: '#6effff',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#cccccc',
            textShadow: '0 0 3px #00e5ff',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#00e5ff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: '1px solid #00cccc',
          boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#001122',
            borderBottom: '1px solid #00e5ff',
            textShadow: '0 0 5px #00e5ff',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.05)',
            boxShadow: 'inset 0 0 5px rgba(0, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000011',
          borderBottom: '1px solid #00e5ff',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        },
      },
    },
  },
})

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
