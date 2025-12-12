import React from 'react'
import { Chip } from '@mui/material'
import { ItemStatus } from '@prisma/client'
import { getStatusColor, getStatusLabel } from '@/lib/item-utils'

interface StatusBadgeProps {
  status: ItemStatus
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
}

export function StatusBadge({ status, size = 'small', variant = 'filled' }: StatusBadgeProps) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)

  return (
    <Chip
      label={label}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? `${color}20` : 'transparent',
        borderColor: color,
        color: color,
        textShadow: `0 0 5px ${color}`,
        fontFamily: '"Share Tech Mono", monospace',
        letterSpacing: '0.5px',
        fontWeight: 'bold',
        border: `1px solid ${color}`,
        boxShadow: `0 0 8px ${color}40`,
        '&:hover': {
          boxShadow: `0 0 12px ${color}60`,
          backgroundColor: variant === 'filled' ? `${color}30` : `${color}10`,
        },
        '& .MuiChip-label': {
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        },
      }}
    />
  )
}
