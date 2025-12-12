'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ItemWithRelations } from '@/lib/item-utils'
import { StatusBadge } from '@/components/StatusBadge'
import { TransactionDialog, TransactionFormData } from '@/components/TransactionDialog'
import { ItemStatus } from '@prisma/client'

// Extended type that includes calculated status from API
type ItemWithStatus = ItemWithRelations & { status: ItemStatus }

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
      id={`item-tabpanel-${index}`}
      aria-labelledby={`item-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface Transaction {
  id: string
  type: string
  quantityChange: number
  performedBy?: string | null
  machineOrArea?: string | null
  jobReference?: string | null
  notes?: string | null
  createdAt: string
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<ItemWithStatus | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  useEffect(() => {
    if (itemId) {
      fetchItemData()
      fetchTransactionHistory()
    }
  }, [itemId])

  const fetchItemData = async () => {
    try {
      const response = await fetch(`/api/items/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data.data)
      } else {
        setError('Item not found')
      }
    } catch (err) {
      console.error('Failed to fetch item:', err)
      setError('Failed to load item data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(`/api/transactions?itemId=${itemId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  }

  const handleTransactionSubmit = async (data: TransactionFormData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          ...data,
        }),
      })

      if (response.ok) {
        // Refresh data
        await fetchItemData()
        await fetchTransactionHistory()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }
    } catch (err) {
      throw err
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (loading) {
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
          LOADING ITEM DATA...
        </Typography>
      </Container>
    )
  }

  if (error || !item) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid #ff4444',
            color: '#ff4444',
          }}
        >
          {error || 'Item not found'}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={() => router.push('/items')}
            className="terminal-button"
          >
            BACK TO INVENTORY
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#00ffff',
              textShadow: '0 0 15px #00ffff',
              fontFamily: '"VT323", monospace',
            }}
          >
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => setTransactionDialogOpen(true)}
              startIcon={<AddIcon />}
              className="terminal-button"
            >
              LOG TRANSACTION
            </Button>
            <Button
              onClick={() => router.push('/admin')}
              startIcon={<EditIcon />}
              className="terminal-button"
            >
              EDIT ITEM (ADMIN)
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <StatusBadge status={item.status} size="medium" />
          {item.sku && (
            <Chip
              label={`SKU: ${item.sku}`}
              sx={{
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid #00cccc',
                color: '#00ffff',
                fontFamily: '"Share Tech Mono", monospace',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper className="terminal-card" sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#00cccc' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#cccccc',
                fontFamily: '"Share Tech Mono", monospace',
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
            <Tab label="DETAILS" />
            <Tab label="TRANSACTION HISTORY" />
            <Tab label="NOTIFICATIONS" />
          </Tabs>
        </Box>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Paper
                className="terminal-card"
                sx={{
                  p: 3,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#00ffff',
                    textShadow: '0 0 8px #00ffff',
                    fontFamily: '"VT323", monospace',
                    mb: 3,
                  }}
                >
                  INVENTORY DETAILS
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      Current Quantity:
                    </Typography>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {Number(item.currentQuantity).toFixed(2)} {item.unitOfMeasure}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      Minimum Quantity:
                    </Typography>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {Number(item.minimumQuantity).toFixed(2)} {item.unitOfMeasure}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      Reorder Quantity:
                    </Typography>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {Number(item.reorderQuantity).toFixed(2)} {item.unitOfMeasure}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      Category:
                    </Typography>
                    <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {item.category.name}
                    </Typography>
                  </Box>

                  {item.location && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        Location:
                      </Typography>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        {item.location.name}
                      </Typography>
                    </Box>
                  )}

                  {item.supplier && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        Supplier:
                      </Typography>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        {item.supplier.name}
                      </Typography>
                    </Box>
                  )}

                  {item.expirationDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        Expiration Date:
                      </Typography>
                      <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                        {format(new Date(item.expirationDate), 'PPP')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid xs={12} md={6}>
              <Paper
                className="terminal-card"
                sx={{
                  p: 3,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#00ffff',
                    textShadow: '0 0 8px #00ffff',
                    fontFamily: '"VT323", monospace',
                    mb: 3,
                  }}
                >
                  ADDITIONAL INFO
                </Typography>

                {item.notes ? (
                  <Typography sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                    {item.notes}
                  </Typography>
                ) : (
                  <Typography sx={{ color: '#666666', fontFamily: '"Share Tech Mono", monospace' }}>
                    No additional notes
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Transaction History Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} className="terminal-card" sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 17, 34, 0.9)',
                    }}
                  >
                    TYPE
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 17, 34, 0.9)',
                    }}
                  >
                    QUANTITY CHANGE
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 17, 34, 0.9)',
                    }}
                  >
                    DETAILS
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#00ffff',
                      textShadow: '0 0 5px #00ffff',
                      fontFamily: '"Share Tech Mono", monospace',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 17, 34, 0.9)',
                    }}
                  >
                    TIMESTAMP
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontFamily: '"Share Tech Mono", monospace',
                        borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                      }}
                    >
                      <Chip
                        label={transaction.type}
                        size="small"
                        sx={{
                          backgroundColor: transaction.type === 'ADD_STOCK' ? 'rgba(0, 255, 0, 0.1)' :
                                         transaction.type === 'CONSUME' ? 'rgba(255, 170, 0, 0.1)' :
                                         'rgba(255, 0, 255, 0.1)',
                          border: `1px solid ${transaction.type === 'ADD_STOCK' ? '#00ff00' :
                                              transaction.type === 'CONSUME' ? '#ffaa00' :
                                              '#ff00ff'}`,
                          color: transaction.type === 'ADD_STOCK' ? '#00ff00' :
                                transaction.type === 'CONSUME' ? '#ffaa00' :
                                '#ff00ff',
                          fontFamily: '"Share Tech Mono", monospace',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: transaction.quantityChange > 0 ? '#00ff00' : '#ffaa00',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                      }}
                    >
                      {transaction.quantityChange > 0 ? '+' : ''}{Number(transaction.quantityChange).toFixed(2)} {item.unitOfMeasure}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#cccccc',
                        fontFamily: '"Share Tech Mono", monospace',
                        borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                      }}
                    >
                      {transaction.machineOrArea && <div>Machine: {transaction.machineOrArea}</div>}
                      {transaction.jobReference && <div>Job: {transaction.jobReference}</div>}
                      {transaction.performedBy && <div>By: {transaction.performedBy}</div>}
                      {transaction.notes && <div>Notes: {transaction.notes}</div>}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#cccccc',
                        fontFamily: '"Share Tech Mono", monospace',
                        borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                      }}
                    >
                      {format(new Date(transaction.createdAt), 'PPp')}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
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
                      NO TRANSACTION HISTORY
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography
            sx={{
              color: '#cccccc',
              fontFamily: '"Share Tech Mono", monospace',
              textAlign: 'center',
              py: 4,
            }}
          >
            NOTIFICATION RULES MANAGEMENT AVAILABLE IN ADMIN PANEL
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              onClick={() => router.push('/admin')}
              className="terminal-button"
            >
              ACCESS ADMIN PANEL
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        onSubmit={handleTransactionSubmit}
        itemName={item.name}
        currentQuantity={Number(item.currentQuantity)}
        unitOfMeasure={item.unitOfMeasure}
      />
    </Container>
  )
}
