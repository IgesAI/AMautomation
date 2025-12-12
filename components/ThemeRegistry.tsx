'use client'

import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'

// Dark blue color scheme
const BLUE = '#0099dd'
const BLUE_LIGHT = '#33bbff'
const BLUE_DARK = '#0077aa'
const BLUE_GLOW = 'rgba(0, 153, 221, 0.5)'
const BLUE_GLOW_LIGHT = 'rgba(0, 153, 221, 0.3)'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: BLUE,
      light: BLUE_LIGHT,
      dark: BLUE_DARK,
    },
    secondary: {
      main: '#ff00ff',
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
      textShadow: `0 0 10px ${BLUE}`,
      letterSpacing: '0.1em',
    },
    h2: {
      fontFamily: '"VT323", monospace',
      fontSize: '2.5rem',
      textShadow: `0 0 8px ${BLUE}`,
      letterSpacing: '0.1em',
    },
    h3: {
      fontFamily: '"VT323", monospace',
      fontSize: '2rem',
      textShadow: `0 0 6px ${BLUE}`,
      letterSpacing: '0.08em',
    },
    h4: {
      fontFamily: '"VT323", monospace',
      fontSize: '1.75rem',
      textShadow: `0 0 5px ${BLUE}`,
      letterSpacing: '0.08em',
    },
    h5: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '1.5rem',
      textShadow: `0 0 4px ${BLUE}`,
      letterSpacing: '0.06em',
    },
    h6: {
      fontFamily: '"Share Tech Mono", monospace',
      fontSize: '1.25rem',
      textShadow: `0 0 3px ${BLUE}`,
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
            background: '#0a0a0a',
          },
          '&::-webkit-scrollbar-thumb': {
            background: BLUE,
            borderRadius: '4px',
            '&:hover': {
              background: BLUE_LIGHT,
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
          border: `1px solid ${BLUE}`,
          borderRadius: '8px',
          boxShadow: `0 0 15px ${BLUE_GLOW}, 0 0 30px ${BLUE_GLOW_LIGHT}`,
          '&:hover': {
            boxShadow: `0 0 20px ${BLUE_GLOW}, 0 0 40px ${BLUE_GLOW_LIGHT}`,
            borderColor: BLUE_LIGHT,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${BLUE}`,
          borderRadius: '2px',
          boxShadow: `0 0 10px ${BLUE_GLOW_LIGHT}`,
          textShadow: `0 0 5px ${BLUE}`,
          '&:hover': {
            backgroundColor: `${BLUE}22`,
            borderColor: BLUE_LIGHT,
            boxShadow: `0 0 20px ${BLUE_GLOW}`,
            textShadow: `0 0 8px ${BLUE_LIGHT}`,
          },
          '&:active': {
            boxShadow: `inset 0 0 10px ${BLUE_GLOW}`,
          },
        },
        contained: {
          backgroundColor: `${BLUE}22`,
          '&:hover': {
            backgroundColor: `${BLUE}44`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            border: `1px solid ${BLUE_DARK}`,
            borderRadius: '2px',
            boxShadow: `0 0 8px ${BLUE_GLOW_LIGHT}`,
            '&:hover': {
              borderColor: BLUE,
              boxShadow: `0 0 12px ${BLUE_GLOW_LIGHT}`,
            },
            '&.Mui-focused': {
              borderColor: BLUE_LIGHT,
              boxShadow: `0 0 15px ${BLUE_GLOW}`,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#cccccc',
            textShadow: `0 0 3px ${BLUE}`,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: BLUE,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: `1px solid ${BLUE_DARK}`,
          boxShadow: `0 0 5px ${BLUE_GLOW_LIGHT}`,
          '&:hover': {
            boxShadow: `0 0 10px ${BLUE_GLOW_LIGHT}`,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#0a0a0a',
            borderBottom: `1px solid ${BLUE}`,
            textShadow: `0 0 5px ${BLUE}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${BLUE}11`,
            boxShadow: `inset 0 0 5px ${BLUE_GLOW_LIGHT}`,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a',
          borderBottom: `1px solid ${BLUE}`,
          boxShadow: `0 0 20px ${BLUE_GLOW_LIGHT}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: BLUE,
          boxShadow: `0 0 10px ${BLUE}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#888888',
          '&.Mui-selected': {
            color: BLUE,
            textShadow: `0 0 8px ${BLUE}`,
          },
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
