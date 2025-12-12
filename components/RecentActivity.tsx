import React from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { InventoryTransaction, ConsumableItem } from '@prisma/client'

interface RecentTransaction extends InventoryTransaction {
  item: {
    name: string
    sku: string | null
    unitOfMeasure: string
  }
}

interface RecentActivityProps {
  transactions: RecentTransaction[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'ADD_STOCK':
        return '#00ff00'
      case 'CONSUME':
        return '#ffaa00'
      case 'ADJUSTMENT':
        return '#ff00ff'
      default:
        return '#00ffff'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'ADD_STOCK':
        return 'ADD'
      case 'CONSUME':
        return 'USE'
      case 'ADJUSTMENT':
        return 'ADJ'
      default:
        return type
    }
  }

  return (
    <Paper
      className="terminal-card"
      sx={{
        p: 3,
        height: '100%',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: '#00ffff',
          textShadow: '0 0 8px #00ffff',
          fontFamily: '"VT323", monospace',
          mb: 3,
          textAlign: 'center',
        }}
      >
        RECENT ACTIVITY
      </Typography>

      {transactions.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            color: '#666666',
            fontFamily: '"Share Tech Mono", monospace',
            py: 4,
          }}
        >
          NO RECENT ACTIVITY
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {transactions.map((transaction) => (
            <ListItem
              key={transaction.id}
              sx={{
                border: '1px solid rgba(0, 204, 204, 0.2)',
                borderRadius: '4px',
                mb: 1,
                backgroundColor: 'rgba(0, 34, 51, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 34, 51, 0.5)',
                  borderColor: 'rgba(0, 204, 204, 0.4)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={getTransactionLabel(transaction.type)}
                      size="small"
                      sx={{
                        backgroundColor: `${getTransactionColor(transaction.type)}20`,
                        border: `1px solid ${getTransactionColor(transaction.type)}`,
                        color: getTransactionColor(transaction.type),
                        textShadow: `0 0 3px ${getTransactionColor(transaction.type)}`,
                        fontFamily: '"Share Tech Mono", monospace',
                        fontSize: '0.7rem',
                        height: '20px',
                      }}
                    />
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontSize: '0.9rem',
                        flex: 1,
                      }}
                    >
                      {transaction.item.name}
                      {transaction.item.sku && (
                        <span style={{ color: '#cccccc', marginLeft: '8px' }}>
                          ({transaction.item.sku})
                        </span>
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        color: getTransactionColor(transaction.type),
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      {transaction.quantityChange > 0 ? '+' : ''}
                      {Number(transaction.quantityChange).toFixed(2)} {transaction.item.unitOfMeasure}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {transaction.machineOrArea && (
                        <Typography
                          component="span"
                          sx={{
                            color: '#00ffff',
                            fontFamily: '"Share Tech Mono", monospace',
                            fontSize: '0.75rem',
                          }}
                        >
                          {transaction.machineOrArea}
                        </Typography>
                      )}
                      {transaction.jobReference && (
                        <Typography
                          component="span"
                          sx={{
                            color: '#cccccc',
                            fontFamily: '"Share Tech Mono", monospace',
                            fontSize: '0.75rem',
                          }}
                        >
                          Job: {transaction.jobReference}
                        </Typography>
                      )}
                      <Typography
                        component="span"
                        sx={{
                          color: '#666666',
                          fontFamily: '"Share Tech Mono", monospace',
                          fontSize: '0.7rem',
                          marginLeft: 'auto',
                        }}
                      >
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    {transaction.performedBy && (
                      <Typography
                        sx={{
                          color: '#888888',
                          fontFamily: '"Share Tech Mono", monospace',
                          fontSize: '0.7rem',
                        }}
                      >
                        By: {transaction.performedBy}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}
