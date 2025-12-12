import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'

interface DashboardSummary {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  expiringSoonItems: number
}

interface DashboardCardsProps {
  summary: DashboardSummary
}

export function DashboardCards({ summary }: DashboardCardsProps) {
  const cards = [
    {
      title: 'TOTAL ITEMS',
      value: summary.totalItems,
      icon: InventoryIcon,
      color: '#00ffff',
      glowColor: 'rgba(0, 255, 255, 0.3)',
    },
    {
      title: 'LOW STOCK',
      value: summary.lowStockItems,
      icon: WarningIcon,
      color: '#ffaa00',
      glowColor: 'rgba(255, 170, 0, 0.3)',
    },
    {
      title: 'OUT OF STOCK',
      value: summary.outOfStockItems,
      icon: ErrorIcon,
      color: '#ff4444',
      glowColor: 'rgba(255, 68, 68, 0.3)',
    },
    {
      title: 'EXPIRING SOON',
      value: summary.expiringSoonItems,
      icon: ScheduleIcon,
      color: '#ff00ff',
      glowColor: 'rgba(255, 0, 255, 0.3)',
    },
  ]

  return (
    <Grid container spacing={3}>
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              className="terminal-card"
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                  boxShadow: `0 0 10px ${card.glowColor}`,
                },
              }}
            >
              <IconComponent
                sx={{
                  fontSize: 48,
                  color: card.color,
                  mb: 2,
                  filter: `drop-shadow(0 0 8px ${card.glowColor})`,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  color: card.color,
                  textShadow: `0 0 10px ${card.color}`,
                  fontFamily: '"VT323", monospace',
                  fontSize: '2.5rem',
                  mb: 1,
                }}
              >
                {card.value}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#cccccc',
                  fontFamily: '"Share Tech Mono", monospace',
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}
