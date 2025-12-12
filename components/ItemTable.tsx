import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material'
import { Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material'
import { ItemWithRelations } from '@/lib/item-utils'
import { StatusBadge } from './StatusBadge'
import { ItemStatus } from '@prisma/client'

// Items from API include calculated status
type ItemWithStatus = ItemWithRelations & { status: ItemStatus }

interface ItemTableProps {
  items: ItemWithStatus[]
  onViewItem?: (itemId: string) => void
  onEditItem?: (itemId: string) => void
  showActions?: boolean
}

export function ItemTable({ items, onViewItem, onEditItem, showActions = true }: ItemTableProps) {
  return (
    <TableContainer
      component={Paper}
      className="terminal-card"
      sx={{
        maxHeight: 600,
        '& .MuiTableHead-root': {
          backgroundColor: 'rgba(0, 17, 34, 0.8)',
        },
        '& .MuiTableRow-root:hover': {
          backgroundColor: 'rgba(0, 255, 255, 0.05)',
        },
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
                backgroundColor: 'rgba(0, 17, 34, 0.9)',
              }}
            >
              NAME
            </TableCell>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              SKU
            </TableCell>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              CATEGORY
            </TableCell>
            <TableCell
              align="right"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              CURRENT
            </TableCell>
            <TableCell
              align="right"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              MIN
            </TableCell>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              UNIT
            </TableCell>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              STATUS
            </TableCell>
            <TableCell
              sx={{
                color: '#0099dd',
                textShadow: '0 0 5px #0099dd',
                fontFamily: '"Share Tech Mono", monospace',
                fontWeight: 'bold',
                borderBottom: '1px solid #0099dd',
              }}
            >
              LOCATION
            </TableCell>
            {showActions && (
              <TableCell
                align="center"
                sx={{
                  color: '#0099dd',
                  textShadow: '0 0 5px #0099dd',
                  fontFamily: '"Share Tech Mono", monospace',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #0099dd',
                }}
              >
                ACTIONS
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell
                sx={{
                  color: '#ffffff',
                  fontFamily: '"Share Tech Mono", monospace',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {item.name}
              </TableCell>
              <TableCell
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: '0.875rem',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {item.sku || '-'}
              </TableCell>
              <TableCell
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {item.category.name}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: '#ffffff',
                  fontFamily: '"Share Tech Mono", monospace',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {Number(item.currentQuantity).toFixed(2)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {Number(item.minimumQuantity).toFixed(2)}
              </TableCell>
              <TableCell
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {item.unitOfMeasure}
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                }}
              >
                {item.location?.name || '-'}
              </TableCell>
              {showActions && (
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {onViewItem && (
                      <IconButton
                        size="small"
                        onClick={() => onViewItem(item.id)}
                        sx={{
                          color: '#0099dd',
                          '&:hover': {
                            color: '#33bbff',
                            backgroundColor: 'rgba(0, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onEditItem && (
                      <IconButton
                        size="small"
                        onClick={() => onEditItem(item.id)}
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
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={showActions ? 9 : 8}
                sx={{
                  textAlign: 'center',
                  color: '#666666',
                  fontFamily: '"Share Tech Mono", monospace',
                  py: 4,
                }}
              >
                NO ITEMS FOUND
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
