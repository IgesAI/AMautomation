'use client'

import React, { useState, useEffect } from 'react'
import { Container, Grid, Typography, Paper, Box, Button, Alert } from '@mui/material'
import { DashboardCards } from '@/components/DashboardCards'
import { ItemTable } from '@/components/ItemTable'
import { RecentActivity } from '@/components/RecentActivity'
import { ItemWithRelations } from '@/lib/item-utils'
import { useRouter } from 'next/navigation'
import { ItemStatus } from '@prisma/client'

// Items from API include calculated status
type ItemWithStatus = ItemWithRelations & { status: ItemStatus }

interface DashboardSummary {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  expiringSoonItems: number
  recentTransactions: Array<{
    id: string
    type: string
    quantityChange: number
    createdAt: string
    performedBy?: string | null
    machineOrArea?: string | null
    jobReference?: string | null
    item: {
      name: string
      sku: string | null
      unitOfMeasure: string
    }
  }>
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [criticalItems, setCriticalItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch summary data
      const summaryResponse = await fetch('/api/summary')
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch summary data')
      }
      const summaryData = await summaryResponse.json()
      setSummary(summaryData.data)

      // Fetch critical items (LOW + OUT_OF_STOCK + EXPIRING_SOON)
      const criticalResponse = await fetch('/api/items?status=LOW&limit=10')
      const outOfStockResponse = await fetch('/api/items?status=OUT_OF_STOCK&limit=10')
      const expiringResponse = await fetch('/api/items?status=EXPIRING_SOON&limit=10')

      const [criticalData, outOfStockData, expiringData] = await Promise.all([
        criticalResponse.json(),
        outOfStockResponse.json(),
        expiringResponse.json()
      ])

      const allCriticalItems = [
        ...(criticalData.data || []),
        ...(outOfStockData.data || []),
        ...(expiringData.data || [])
      ]

      // Remove duplicates and limit to 20 items
      const uniqueItems = allCriticalItems.filter((item, index, self) =>
        index === self.findIndex(i => i.id === item.id)
      ).slice(0, 20)

      setCriticalItems(uniqueItems)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewItem = (itemId: string) => {
    router.push(`/items/${itemId}`)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#00ffff',
            textShadow: '0 0 10px #00ffff',
            fontFamily: '"VT323", monospace',
            textAlign: 'center',
            mb: 4,
          }}
        >
          LOADING SYSTEM STATUS...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography
            sx={{
              color: '#cccccc',
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: '1.2rem',
            }}
          >
            INITIALIZING TERMINAL...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid #ff4444',
            color: '#ff4444',
            '& .MuiAlert-icon': {
              color: '#ff4444',
            },
          }}
        >
          SYSTEM ERROR: {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={fetchDashboardData}
            className="terminal-button"
            sx={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
              },
            }}
          >
            RETRY CONNECTION
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#00ffff',
            textShadow: '0 0 15px #00ffff',
            fontFamily: '"VT323", monospace',
            mb: 2,
            letterSpacing: '0.1em',
          }}
        >
          AM CONSUMABLES INVENTORY SYSTEM
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            letterSpacing: '0.05em',
          }}
        >
          ADDITIVE MANUFACTURING RESOURCE MANAGEMENT TERMINAL
        </Typography>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Box sx={{ mb: 4 }}>
          <DashboardCards summary={summary} />
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Critical Items Table */}
        <Grid xs={12} lg={8}>
          <Paper
            className="terminal-card"
            sx={{
              p: 3,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffaa00',
                  textShadow: '0 0 10px #ffaa00',
                  fontFamily: '"VT323", monospace',
                }}
              >
                CRITICAL ITEMS ALERT
              </Typography>
              <Button
                onClick={() => router.push('/items')}
                className="terminal-button"
                size="small"
              >
                VIEW ALL ITEMS
              </Button>
            </Box>

            {criticalItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  sx={{
                    color: '#00ff00',
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '1.1rem',
                  }}
                >
                  ✓ ALL SYSTEMS NOMINAL
                </Typography>
                <Typography
                  sx={{
                    color: '#cccccc',
                    fontFamily: '"Share Tech Mono", monospace',
                    mt: 1,
                  }}
                >
                  No critical inventory issues detected
                </Typography>
              </Box>
            ) : (
              <ItemTable
                items={criticalItems}
                onViewItem={handleViewItem}
                showActions={true}
              />
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid xs={12} lg={4}>
          {summary && <RecentActivity transactions={summary.recentTransactions} />}
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#00ffff',
            textShadow: '0 0 8px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            mb: 2,
          }}
        >
          QUICK ACTIONS
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => router.push('/use')}
            className="terminal-button"
            size="large"
          >
            LOG CONSUMPTION
          </Button>
          <Button
            onClick={() => router.push('/items')}
            className="terminal-button"
            size="large"
          >
            INVENTORY MANAGEMENT
          </Button>
          <Button
            onClick={() => router.push('/admin')}
            className="terminal-button"
            size="large"
          >
            ADMIN PANEL
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
