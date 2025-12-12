import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'

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
      title: 'Total Items',
      value: summary.totalItems,
      color: '#00ffff',
    },
    {
      title: 'Low Stock',
      value: summary.lowStockItems,
      color: '#ffaa00',
    },
    {
      title: 'Out of Stock',
      value: summary.outOfStockItems,
      color: '#ff4444',
    },
    {
      title: 'Expiring Soon',
      value: summary.expiringSoonItems,
      color: '#00ff00',
    },
  ]

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }} key={card.title}>
          <Paper
            className="terminal-card"
            sx={{
              p: 2,
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              background: 'linear-gradient(180deg, rgba(0, 17, 34, 0.95), rgba(0, 34, 51, 0.95))',
              border: '1px solid #00cccc',
              borderRadius: '4px',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
            }}
          >
            <Typography
              sx={{
                color: '#00ffff',
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                mb: 1,
              }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: card.color,
                textShadow: `0 0 8px ${card.color}`,
                fontFamily: '"VT323", monospace',
                fontSize: '2.5rem',
                lineHeight: 1,
              }}
            >
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
