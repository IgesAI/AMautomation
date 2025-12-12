'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface Category {
  id: string
  name: string
  description?: string | null
  sortOrder?: number | null
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tabValue, setTabValue] = useState(0)

  // Data states
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/me')
      if (response.ok) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      // Not authenticated
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: loginPassword }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setLoginPassword('')
      } else {
        setLoginError('Invalid password')
      }
    } catch (error) {
      setLoginError('Login failed')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setTabValue(0)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 10px #00ffff',
            fontFamily: '"VT323", monospace',
            textAlign: 'center',
            fontSize: '1.5rem',
          }}
        >
          INITIALIZING ADMIN TERMINAL...
        </Typography>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          className="terminal-card"
          sx={{
            p: 6,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#00ffff',
              textShadow: '0 0 15px #00ffff',
              fontFamily: '"VT323", monospace',
              textAlign: 'center',
              mb: 4,
            }}
          >
            ADMIN ACCESS REQUIRED
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              label="ADMIN PASSWORD"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="terminal-input"
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            {loginError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                }}
              >
                {loginError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<LoginIcon />}
              className="terminal-button"
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              AUTHENTICATE
            </Button>
          </form>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#00ffff',
            textShadow: '0 0 15px #00ffff',
            fontFamily: '"VT323", monospace',
          }}
        >
          ADMIN CONTROL TERMINAL
        </Typography>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          className="terminal-button"
          sx={{
            color: '#ff4444',
            borderColor: '#ff4444',
            '&:hover': {
              borderColor: '#ff6666',
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
            },
          }}
        >
          LOGOUT
        </Button>
      </Box>

      {/* Admin Tabs */}
      <Paper className="terminal-card" sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#00cccc' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#cccccc',
                fontFamily: '"Share Tech Mono", monospace',
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#00ffff',
                  textShadow: '0 0 8px #00ffff',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ffff',
                boxShadow: '0 0 10px #00ffff',
              },
            }}
          >
            <Tab label="ITEMS" />
            <Tab label="CATEGORIES" />
            <Tab label="LOCATIONS" />
            <Tab label="SUPPLIERS" />
            <Tab label="NOTIFICATIONS" />
            <Tab label="ACTIVITY LOG" />
          </Tabs>
        </Box>

        {/* Categories Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#00ffff',
                textShadow: '0 0 8px #00ffff',
                fontFamily: '"VT323", monospace',
              }}
            >
              CONSUMABLE CATEGORIES
            </Typography>
            <Button
              startIcon={<AddIcon />}
              className="terminal-button"
            >
              ADD CATEGORY
            </Button>
          </Box>

          <TableContainer component={Paper} className="terminal-card">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    DESCRIPTION
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    SORT ORDER
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontFamily: '"Share Tech Mono", monospace',
                      }}
                    >
                      {category.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#cccccc',
                        fontFamily: '"Share Tech Mono", monospace',
                      }}
                    >
                      {category.description || '-'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#cccccc',
                        fontFamily: '"Share Tech Mono", monospace',
                      }}
                    >
                      {category.sortOrder || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{
                          color: '#ffaa00',
                          '&:hover': {
                            color: '#ffcc00',
                            backgroundColor: 'rgba(255, 170, 0, 0.1)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: '#ff4444',
                          '&:hover': {
                            color: '#ff6666',
                            backgroundColor: 'rgba(255, 68, 68, 0.1)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        textAlign: 'center',
                        color: '#666666',
                        fontFamily: '"Share Tech Mono", monospace',
                        py: 4,
                      }}
                    >
                      NO CATEGORIES FOUND
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Placeholder tabs for other sections */}
        {[0, 2, 3, 4, 5].map((index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  mb: 2,
                }}
              >
                {index === 0 && 'ITEM MANAGEMENT'}
                {index === 2 && 'LOCATION MANAGEMENT'}
                {index === 3 && 'SUPPLIER MANAGEMENT'}
                {index === 4 && 'NOTIFICATION RULES'}
                {index === 5 && 'ACTIVITY LOG'}
              </Typography>
              <Typography
                sx={{
                  color: '#666666',
                  fontFamily: '"Share Tech Mono", monospace',
                  mb: 4,
                }}
              >
                This section is under development
              </Typography>
              <Button
                onClick={() => router.push('/')}
                className="terminal-button"
              >
                RETURN TO DASHBOARD
              </Button>
            </Box>
          </TabPanel>
        ))}
      </Paper>
    </Container>
  )
}
