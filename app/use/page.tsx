'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { TransactionFormData } from '@/components/TransactionDialog'

interface ItemOption {
  id: string
  name: string
  sku: string | null
  unitOfMeasure: string
  currentQuantity: number
}

const MACHINE_OPTIONS = [
  'AM400',
  'RenAM 500Q',
  'Post-Processing',
  'Quality Control',
  'Maintenance',
  'Other',
]

export default function QuickUsagePage() {
  const router = useRouter()
  const [items, setItems] = useState<ItemOption[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null)
  const [formData, setFormData] = useState<Omit<TransactionFormData, 'type'>>({
    quantity: 0,
    performedBy: '',
    machineOrArea: '',
    jobReference: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          type: 'CONSUME',
          ...formData,
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form
        setSelectedItem(null)
        setFormData({
          quantity: 0,
          performedBy: '',
          machineOrArea: '',
          jobReference: '',
          notes: '',
        })
        // Auto redirect after success
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to log usage')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getItemDisplayLabel = (item: ItemOption) => {
    if (item.sku) {
      return `${item.name} (${item.sku}) - ${item.currentQuantity} ${item.unitOfMeasure} available`
    }
    return `${item.name} - ${item.currentQuantity} ${item.unitOfMeasure} available`
  }

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          className="terminal-card"
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: '#00ff00',
              textShadow: '0 0 15px #00ff00',
              fontFamily: '"VT323", monospace',
              mb: 3,
            }}
          >
            ✓ USAGE LOGGED SUCCESSFULLY
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#cccccc',
              fontFamily: '"Share Tech Mono", monospace',
              mb: 4,
            }}
          >
            INVENTORY UPDATED • NOTIFICATIONS SENT
          </Typography>
          <Typography
            sx={{
              color: '#888888',
              fontFamily: '"Share Tech Mono", monospace',
              mb: 4,
            }}
          >
            Redirecting to dashboard in 2 seconds...
          </Typography>
          <Button
            onClick={() => router.push('/')}
            className="terminal-button"
            size="large"
          >
            RETURN TO DASHBOARD
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: '#00e5ff',
            textShadow: '0 0 15px #00e5ff',
            fontFamily: '"VT323", monospace',
            mb: 2,
          }}
        >
          QUICK USAGE LOG
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
          }}
        >
          LOG CONSUMABLE USAGE AFTER JOBS
        </Typography>
      </Box>

      <Paper
        className="terminal-card"
        sx={{
          p: 4,
        }}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid #ff4444',
                color: '#ff4444',
                '& .MuiAlert-icon': {
                  color: '#ff4444',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Item Selection */}
            <Autocomplete
              options={items}
              getOptionLabel={getItemDisplayLabel}
              value={selectedItem}
              onChange={(event, newValue) => setSelectedItem(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="SELECT CONSUMABLE"
                  className="terminal-input"
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    color: '#ffffff',
                    fontFamily: '"Share Tech Mono", monospace',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  {getItemDisplayLabel(option)}
                </Box>
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': {
                  color: '#00e5ff',
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: '#00e5ff',
                },
              }}
            />

            {/* Quantity */}
            <TextField
              label="QUANTITY USED"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              className="terminal-input"
              required
              helperText={selectedItem ? `Available: ${selectedItem.currentQuantity} ${selectedItem.unitOfMeasure}` : ''}
              sx={{
                '& .MuiFormHelperText-root': {
                  color: '#888888',
                  fontFamily: '"Share Tech Mono", monospace',
                },
              }}
            />

            {/* Machine/Area */}
            <FormControl>
              <InputLabel
                sx={{
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#00e5ff' },
                }}
              >
                MACHINE/AREA
              </InputLabel>
              <Select
                value={formData.machineOrArea || ''}
                label="MACHINE/AREA"
                onChange={(e) => setFormData({ ...formData, machineOrArea: e.target.value })}
                className="terminal-input"
                required
              >
                {MACHINE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Job Reference */}
            <TextField
              label="JOB REFERENCE (OPTIONAL)"
              value={formData.jobReference || ''}
              onChange={(e) => setFormData({ ...formData, jobReference: e.target.value })}
              className="terminal-input"
              placeholder="Build ID, work order number, etc."
            />

            {/* Performed By */}
            <TextField
              label="PERFORMED BY (OPTIONAL)"
              value={formData.performedBy || ''}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
              className="terminal-input"
              placeholder="Your name or identifier"
            />

            {/* Notes */}
            <TextField
              label="NOTES (OPTIONAL)"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="terminal-input"
              multiline
              rows={2}
              placeholder="Any additional notes about this usage"
            />

            {/* Submit Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !selectedItem || formData.quantity <= 0}
                startIcon={<SendIcon />}
                className="terminal-button"
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1.1rem',
                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 255, 0.2)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(136, 136, 136, 0.1)',
                    color: '#666666',
                  },
                }}
              >
                {loading ? 'LOGGING USAGE...' : 'LOG USAGE'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          onClick={() => router.push('/')}
          className="terminal-button"
        >
          BACK TO DASHBOARD
        </Button>
      </Box>
    </Container>
  )
}
