'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Search as SearchIcon, FilterList as FilterIcon, Add as AddIcon } from '@mui/icons-material'
import { ItemWithRelations } from '@/lib/item-utils'
import { StatusBadge } from '@/components/StatusBadge'
import { useRouter } from 'next/navigation'
import { ItemStatus } from '@prisma/client'

// Items from API include calculated status
type ItemWithStatus = ItemWithRelations & { status: ItemStatus }

export default function InventoryPage() {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [searchTerm, statusFilter, categoryFilter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('categoryId', categoryFilter)

      const response = await fetch(`/api/items?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'NAME',
      width: 250,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          NAME
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#ffffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          SKU
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'CATEGORY',
      width: 150,
      valueGetter: (value, row) => row.category.name,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          CATEGORY
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'currentQuantity',
      headerName: 'CURRENT',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          CURRENT
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#ffffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
            fontWeight: 'bold',
          }}
        >
          {Number(params.value).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'minimumQuantity',
      headerName: 'MIN',
      width: 80,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          MIN
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {Number(params.value).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'unitOfMeasure',
      headerName: 'UNIT',
      width: 80,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          UNIT
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 120,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          STATUS
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <StatusBadge status={params.value} />
      ),
    },
    {
      field: 'location',
      headerName: 'LOCATION',
      width: 150,
      valueGetter: (value, row) => row.location?.name || '-',
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          LOCATION
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          sx={{
            color: '#cccccc',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      renderHeader: (params) => (
        <Typography
          sx={{
            color: '#00ffff',
            textShadow: '0 0 5px #00ffff',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          ACTIONS
        </Typography>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/items/${params.row.id}`)}
            sx={{
              color: '#00ffff',
              '&:hover': {
                color: '#33ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
              },
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#00ffff',
            textShadow: '0 0 15px #00ffff',
            fontFamily: '"VT323", monospace',
            mb: 2,
            textAlign: 'center',
          }}
        >
          INVENTORY MANAGEMENT SYSTEM
        </Typography>

        {/* Filters */}
        <Paper
          className="terminal-card"
          sx={{
            p: 3,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="terminal-input"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#cccccc', mr: 1 }} />,
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel
                sx={{
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#00ffff' },
                }}
              >
                Status Filter
              </InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="terminal-input"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="LOW">Low Stock</MenuItem>
                <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                <MenuItem value="EXPIRING_SOON">Expiring Soon</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel
                sx={{
                  color: '#cccccc',
                  '&.Mui-focused': { color: '#00ffff' },
                }}
              >
                Category Filter
              </InputLabel>
              <Select
                value={categoryFilter}
                label="Category Filter"
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="terminal-input"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setCategoryFilter('')
              }}
              className="terminal-button"
            >
              CLEAR FILTERS
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Data Grid */}
      <Paper
        className="terminal-card"
        sx={{
          height: 600,
          width: '100%',
        }}
      >
        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 17, 34, 0.9)',
              borderBottom: '1px solid #00ffff',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.05)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0, 204, 204, 0.2)',
              color: '#ffffff',
              fontFamily: '"Share Tech Mono", monospace',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgba(0, 17, 34, 0.9)',
              borderTop: '1px solid #00cccc',
            },
            '& .MuiTablePagination-root': {
              color: '#cccccc',
              fontFamily: '"Share Tech Mono", monospace',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: '#cccccc',
              fontFamily: '"Share Tech Mono", monospace',
            },
          }}
        />
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          onClick={() => router.push('/admin')}
          startIcon={<AddIcon />}
          className="terminal-button"
          size="large"
        >
          ADD NEW ITEM (ADMIN)
        </Button>
      </Box>
    </Container>
  )
}
