import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { TransactionType } from '@prisma/client'

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => Promise<void>
  itemName: string
  currentQuantity: number
  unitOfMeasure: string
  loading?: boolean
}

export interface TransactionFormData {
  type: TransactionType
  quantity: number
  performedBy?: string
  machineOrArea?: string
  jobReference?: string
  notes?: string
}

const MACHINE_OPTIONS = [
  'AM400',
  'RenAM 500Q',
  'Post-Processing',
  'Quality Control',
  'Maintenance',
  'Other',
]

export function TransactionDialog({
  open,
  onClose,
  onSubmit,
  itemName,
  currentQuantity,
  unitOfMeasure,
  loading = false,
}: TransactionDialogProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.CONSUME,
    quantity: 0,
  })
  const [error, setError] = useState<string>('')

  const handleSubmit = async () => {
    setError('')

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (formData.type === TransactionType.CONSUME && formData.quantity > currentQuantity) {
      setError(`Cannot consume more than current quantity (${currentQuantity} ${unitOfMeasure})`)
      return
    }

    try {
      await onSubmit(formData)
      setFormData({
        type: TransactionType.CONSUME,
        quantity: 0,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    setFormData({
      type: TransactionType.CONSUME,
      quantity: 0,
    })
    setError('')
    onClose()
  }

  const getQuantityHelperText = () => {
    if (formData.type === TransactionType.CONSUME) {
      return `Current: ${currentQuantity} ${unitOfMeasure}`
    }
    return `Will add to current stock`
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'terminal-card',
        sx: {
          background: 'linear-gradient(135deg, rgba(0, 17, 34, 0.95), rgba(0, 34, 51, 0.95))',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: '#00ffff',
          textShadow: '0 0 8px #00ffff',
          fontFamily: '"VT323", monospace',
          fontSize: '1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid #00cccc',
        }}
      >
        LOG TRANSACTION
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#ffffff',
            textAlign: 'center',
            mb: 3,
            fontFamily: '"Share Tech Mono", monospace',
          }}
        >
          {itemName}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: '#cccccc',
                '&.Mui-focused': { color: '#00ffff' },
              }}
            >
              Transaction Type
            </InputLabel>
            <Select
              value={formData.type}
              label="Transaction Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
              className="terminal-input"
              sx={{
                '& .MuiSelect-select': {
                  color: '#ffffff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00cccc',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00ffff',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00ffff',
                  boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
                },
              }}
            >
              <MenuItem value={TransactionType.ADD_STOCK}>Add Stock</MenuItem>
              <MenuItem value={TransactionType.CONSUME}>Consume</MenuItem>
              <MenuItem value={TransactionType.ADJUSTMENT}>Adjustment</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            fullWidth
            helperText={getQuantityHelperText()}
            className="terminal-input"
            sx={{
              '& .MuiFormHelperText-root': {
                color: '#888888',
                fontFamily: '"Share Tech Mono", monospace',
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: '#cccccc',
                '&.Mui-focused': { color: '#00ffff' },
              }}
            >
              Machine/Area
            </InputLabel>
            <Select
              value={formData.machineOrArea || ''}
              label="Machine/Area"
              onChange={(e) => setFormData({ ...formData, machineOrArea: e.target.value })}
              className="terminal-input"
              sx={{
                '& .MuiSelect-select': {
                  color: '#ffffff',
                },
              }}
            >
              {MACHINE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Job Reference (optional)"
            value={formData.jobReference || ''}
            onChange={(e) => setFormData({ ...formData, jobReference: e.target.value })}
            fullWidth
            placeholder="Build ID, work order, etc."
            className="terminal-input"
          />

          <TextField
            label="Performed By (optional)"
            value={formData.performedBy || ''}
            onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            fullWidth
            placeholder="Your name or identifier"
            className="terminal-input"
          />

          <TextField
            label="Notes (optional)"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
            className="terminal-input"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #00cccc' }}>
        <Button
          onClick={handleClose}
          className="terminal-button"
          sx={{
            color: '#cccccc',
            borderColor: '#666666',
            '&:hover': {
              borderColor: '#888888',
              backgroundColor: 'rgba(136, 136, 136, 0.1)',
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          className="terminal-button"
          sx={{
            ml: 2,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.2)',
            },
          }}
        >
          {loading ? 'PROCESSING...' : 'SUBMIT'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
