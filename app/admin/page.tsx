'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface Category {
  id: string
  name: string
  description?: string | null
  sortOrder?: number | null
}

interface Location {
  id: string
  name: string
  description?: string | null
}

interface Supplier {
  id: string
  name: string
  contactEmail?: string | null
  phone?: string | null
}

interface ConsumableItem {
  id: string
  name: string
  sku?: string | null
  categoryId: string
  unitOfMeasure: string
  currentQuantity: number
  minimumQuantity: number
  reorderQuantity: number
  locationId?: string | null
  supplierId?: string | null
  notes?: string | null
  isActive: boolean
  notificationEmails?: string[]
  category?: Category
  location?: Location | null
  supplier?: Supplier | null
}

interface ItemFormData {
  name: string
  sku: string
  categoryId: string
  unitOfMeasure: string
  currentQuantity: string
  minimumQuantity: string
  reorderQuantity: string
  locationId: string
  supplierId: string
  notes: string
  notificationEmails: string
}

const initialItemForm: ItemFormData = {
  name: '',
  sku: '',
  categoryId: '',
  unitOfMeasure: 'pcs',
  currentQuantity: '0',
  minimumQuantity: '10',
  reorderQuantity: '50',
  locationId: '',
  supplierId: '',
  notes: '',
  notificationEmails: '',
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  // Data states
  const [items, setItems] = useState<ConsumableItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ConsumableItem | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormData>(initialItemForm)
  const [itemFormError, setItemFormError] = useState('')
  const [itemSaving, setItemSaving] = useState(false)

  // Category dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', sortOrder: '' })
  const [categorySaving, setCategorySaving] = useState(false)

  // Location dialog states
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [locationForm, setLocationForm] = useState({ name: '', description: '' })
  const [locationSaving, setLocationSaving] = useState(false)

  // Supplier dialog states
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [supplierForm, setSupplierForm] = useState({ name: '', contactEmail: '', phone: '', notes: '' })
  const [supplierSaving, setSupplierSaving] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/me')
      if (response.ok) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      // Not authenticated
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchItems(),
      fetchCategories(),
      fetchLocations(),
      fetchSuppliers(),
    ])
    setLoading(false)
  }

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        // Fetch notification rules for each item
        const itemsWithNotifications = await Promise.all(
          (data.data || []).map(async (item: ConsumableItem) => {
            try {
              const rulesRes = await fetch(`/api/notification-rules?itemId=${item.id}`)
              if (rulesRes.ok) {
                const rulesData = await rulesRes.json()
                const emails = rulesData.data?.[0]?.emails || []
                return { ...item, notificationEmails: emails }
              }
            } catch {
              // Ignore errors
            }
            return { ...item, notificationEmails: [] }
          })
        )
        setItems(itemsWithNotifications)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
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

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: loginPassword }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setLoginPassword('')
      } else {
        setLoginError('Invalid password')
      }
    } catch (error) {
      setLoginError('Login failed')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setTabValue(0)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Item CRUD handlers
  const openItemDialog = (item?: ConsumableItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        sku: item.sku || '',
        categoryId: item.categoryId,
        unitOfMeasure: item.unitOfMeasure,
        currentQuantity: String(item.currentQuantity),
        minimumQuantity: String(item.minimumQuantity),
        reorderQuantity: String(item.reorderQuantity),
        locationId: item.locationId || '',
        supplierId: item.supplierId || '',
        notes: item.notes || '',
        notificationEmails: item.notificationEmails?.join(', ') || '',
      })
    } else {
      setEditingItem(null)
      setItemForm(initialItemForm)
    }
    setItemFormError('')
    setItemDialogOpen(true)
  }

  const closeItemDialog = () => {
    setItemDialogOpen(false)
    setEditingItem(null)
    setItemForm(initialItemForm)
    setItemFormError('')
  }

  const handleItemFormChange = (field: keyof ItemFormData, value: string) => {
    setItemForm(prev => ({ ...prev, [field]: value }))
  }

  const saveItem = async () => {
    // Validation
    if (!itemForm.name.trim()) {
      setItemFormError('Item name is required')
      return
    }
    if (!itemForm.categoryId) {
      setItemFormError('Category is required')
      return
    }

    setItemSaving(true)
    setItemFormError('')

    try {
      const itemData = {
        name: itemForm.name.trim(),
        sku: itemForm.sku.trim() || null,
        categoryId: itemForm.categoryId,
        unitOfMeasure: itemForm.unitOfMeasure,
        currentQuantity: parseFloat(itemForm.currentQuantity) || 0,
        minimumQuantity: parseFloat(itemForm.minimumQuantity) || 0,
        reorderQuantity: parseFloat(itemForm.reorderQuantity) || 0,
        locationId: itemForm.locationId || null,
        supplierId: itemForm.supplierId || null,
        notes: itemForm.notes.trim() || null,
      }

      let savedItemId: string

      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (!response.ok) throw new Error('Failed to update item')
        savedItemId = editingItem.id
      } else {
        // Create new item
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
        if (!response.ok) throw new Error('Failed to create item')
        const data = await response.json()
        savedItemId = data.data.id
      }

      // Handle notification emails
      const emails = itemForm.notificationEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      if (emails.length > 0) {
        // Create or update notification rule for this item
        await fetch('/api/notification-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: savedItemId,
            emails: emails,
            notifyOnLowStock: true,
            notifyOnOutOfStock: true,
          }),
        })
      }

      setSuccessMessage(editingItem ? 'Item updated successfully!' : 'Item created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      closeItemDialog()
      fetchItems()
    } catch (error) {
      setItemFormError('Failed to save item. Please try again.')
    } finally {
      setItemSaving(false)
    }
  }

  // Category CRUD handlers
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        sortOrder: category.sortOrder?.toString() || '',
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', sortOrder: '' })
    }
    setCategoryDialogOpen(true)
  }

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false)
    setEditingCategory(null)
    setCategoryForm({ name: '', description: '', sortOrder: '' })
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return

    setCategorySaving(true)
    try {
      const categoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        sortOrder: categoryForm.sortOrder ? parseInt(categoryForm.sortOrder) : null,
      }

      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        })
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        })
      }

      setSuccessMessage(editingCategory ? 'Category updated!' : 'Category created!')
      setTimeout(() => setSuccessMessage(''), 3000)
      closeCategoryDialog()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setCategorySaving(false)
    }
  }

  // Location CRUD handlers
  const openLocationDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
      setLocationForm({
        name: location.name,
        description: location.description || '',
      })
    } else {
      setEditingLocation(null)
      setLocationForm({ name: '', description: '' })
    }
    setLocationDialogOpen(true)
  }

  const closeLocationDialog = () => {
    setLocationDialogOpen(false)
    setEditingLocation(null)
    setLocationForm({ name: '', description: '' })
  }

  const saveLocation = async () => {
    if (!locationForm.name.trim()) return

    setLocationSaving(true)
    try {
      const locationData = {
        name: locationForm.name.trim(),
        description: locationForm.description.trim() || null,
      }

      if (editingLocation) {
        await fetch(`/api/locations/${editingLocation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationData),
        })
      } else {
        await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationData),
        })
      }

      setSuccessMessage(editingLocation ? 'Location updated!' : 'Location created!')
      setTimeout(() => setSuccessMessage(''), 3000)
      closeLocationDialog()
      fetchLocations()
    } catch (error) {
      console.error('Failed to save location:', error)
    } finally {
      setLocationSaving(false)
    }
  }

  // Supplier CRUD handlers
  const openSupplierDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setSupplierForm({
        name: supplier.name,
        contactEmail: supplier.contactEmail || '',
        phone: supplier.phone || '',
        notes: '',
      })
    } else {
      setEditingSupplier(null)
      setSupplierForm({ name: '', contactEmail: '', phone: '', notes: '' })
    }
    setSupplierDialogOpen(true)
  }

  const closeSupplierDialog = () => {
    setSupplierDialogOpen(false)
    setEditingSupplier(null)
    setSupplierForm({ name: '', contactEmail: '', phone: '', notes: '' })
  }

  const saveSupplier = async () => {
    if (!supplierForm.name.trim()) return

    setSupplierSaving(true)
    try {
      const supplierData = {
        name: supplierForm.name.trim(),
        contactEmail: supplierForm.contactEmail.trim() || null,
        phone: supplierForm.phone.trim() || null,
        notes: supplierForm.notes.trim() || null,
      }

      if (editingSupplier) {
        await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        })
      } else {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        })
      }

      setSuccessMessage(editingSupplier ? 'Supplier updated!' : 'Supplier created!')
      setTimeout(() => setSuccessMessage(''), 3000)
      closeSupplierDialog()
      fetchSuppliers()
    } catch (error) {
      console.error('Failed to save supplier:', error)
    } finally {
      setSupplierSaving(false)
    }
  }

  // Delete handlers
  const confirmDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return

    try {
      let endpoint = ''
      if (deleteTarget.type === 'item') endpoint = `/api/items/${deleteTarget.id}`
      else if (deleteTarget.type === 'category') endpoint = `/api/categories/${deleteTarget.id}`
      else if (deleteTarget.type === 'location') endpoint = `/api/locations/${deleteTarget.id}`
      else if (deleteTarget.type === 'supplier') endpoint = `/api/suppliers/${deleteTarget.id}`

      const response = await fetch(endpoint, { method: 'DELETE' })
      if (response.ok) {
        setSuccessMessage(`${deleteTarget.type} deleted successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
        if (deleteTarget.type === 'item') fetchItems()
        else if (deleteTarget.type === 'category') fetchCategories()
        else if (deleteTarget.type === 'location') fetchLocations()
        else if (deleteTarget.type === 'supplier') fetchSuppliers()
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          sx={{
            color: '#0099dd',
            textShadow: '0 0 10px #0099dd',
            fontFamily: '"VT323", monospace',
            textAlign: 'center',
            fontSize: '1.5rem',
          }}
        >
          INITIALIZING ADMIN TERMINAL...
        </Typography>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper className="terminal-card" sx={{ p: 6 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#0099dd',
              textShadow: '0 0 20px #0099dd, 0 0 40px #0099dd',
              fontFamily: '"VT323", monospace',
              textAlign: 'center',
              mb: 4,
            }}
          >
            {'>'} Admin Access Required<span style={{ animation: 'blink 1s infinite' }}>_</span>
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              label="ADMIN PASSWORD"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="terminal-input"
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            {loginError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                }}
              >
                {loginError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<LoginIcon />}
              className="terminal-button"
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              AUTHENTICATE
            </Button>
          </form>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid #00ff88',
            color: '#00ff88',
          }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => router.push('/')}
            startIcon={<ArrowBackIcon />}
            className="terminal-button"
            size="small"
          >
            BACK
          </Button>
          <Typography
            variant="h4"
            sx={{
              color: '#0099dd',
              textShadow: '0 0 20px #0099dd, 0 0 40px #0099dd',
              fontFamily: '"VT323", monospace',
            }}
          >
            {'>'} Admin Control Terminal<span style={{ animation: 'blink 1s infinite' }}>_</span>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={fetchAllData}
            startIcon={<RefreshIcon />}
            className="terminal-button"
            disabled={loading}
          >
            REFRESH
          </Button>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            className="terminal-button"
            sx={{
              color: '#ff4444',
              borderColor: '#ff4444',
              '&:hover': {
                borderColor: '#ff6666',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
              },
            }}
          >
            LOGOUT
          </Button>
        </Box>
      </Box>

      {/* Admin Tabs */}
      <Paper className="terminal-card" sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#00cccc' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#cccccc',
                fontFamily: '"Share Tech Mono", monospace',
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#0099dd',
                  textShadow: '0 0 8px #0099dd',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0099dd',
                boxShadow: '0 0 10px #0099dd',
              },
            }}
          >
            <Tab label="ITEMS" />
            <Tab label="CATEGORIES" />
            <Tab label="LOCATIONS" />
            <Tab label="SUPPLIERS" />
          </Tabs>
        </Box>

        {/* ITEMS TAB */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 15px #0099dd, 0 0 30px #0099dd',
                fontFamily: '"VT323", monospace',
              }}
            >
              {'>'} Consumable Items
            </Typography>
            <Button
              startIcon={<AddIcon />}
              className="terminal-button"
              onClick={() => openItemDialog()}
              disabled={categories.length === 0}
            >
              ADD ITEM
            </Button>
          </Box>

          {categories.length === 0 && (
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid #ffaa00',
                color: '#ffaa00',
              }}
            >
              You need to create at least one category before adding items.
            </Alert>
          )}

          <TableContainer component={Paper} className="terminal-card">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['NAME', 'SKU', 'CATEGORY', 'CURRENT', 'MIN (TRIGGER)', 'TARGET', 'UNIT', 'NOTIFY EMAILS', 'ACTIONS'].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: '#0099dd',
                        textShadow: '0 0 5px #0099dd',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace' }}>
                      {item.name}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {item.sku || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {item.category?.name || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace', fontWeight: 'bold' }}>
                      {Number(item.currentQuantity).toFixed(0)}
                    </TableCell>
                    <TableCell sx={{ color: '#ffaa00', fontFamily: '"Share Tech Mono", monospace' }}>
                      {Number(item.minimumQuantity).toFixed(0)}
                    </TableCell>
                    <TableCell sx={{ color: '#00ff88', fontFamily: '"Share Tech Mono", monospace' }}>
                      {Number(item.reorderQuantity).toFixed(0)}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {item.unitOfMeasure}
                    </TableCell>
                    <TableCell>
                      {item.notificationEmails && item.notificationEmails.length > 0 ? (
                        <Tooltip title={item.notificationEmails.join(', ')}>
                          <Chip
                            icon={<EmailIcon sx={{ fontSize: 14 }} />}
                            label={`${item.notificationEmails.length} email(s)`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(0, 255, 255, 0.1)',
                              color: '#0099dd',
                              border: '1px solid #0099dd',
                              fontFamily: '"Share Tech Mono", monospace',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography sx={{ color: '#666', fontSize: '0.75rem', fontFamily: '"Share Tech Mono", monospace' }}>
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openItemDialog(item)}
                        sx={{ color: '#ffaa00', '&:hover': { color: '#ffcc00', backgroundColor: 'rgba(255, 170, 0, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDelete('item', item.id, item.name)}
                        sx={{ color: '#ff4444', '&:hover': { color: '#ff6666', backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      sx={{ textAlign: 'center', color: '#666666', fontFamily: '"Share Tech Mono", monospace', py: 4 }}
                    >
                      NO ITEMS FOUND - CREATE CATEGORIES FIRST, THEN ADD ITEMS
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* CATEGORIES TAB */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 15px #0099dd, 0 0 30px #0099dd',
                fontFamily: '"VT323", monospace',
              }}
            >
              {'>'} Consumable Categories
            </Typography>
            <Button startIcon={<AddIcon />} className="terminal-button" onClick={() => openCategoryDialog()}>
              ADD CATEGORY
            </Button>
          </Box>

          <TableContainer component={Paper} className="terminal-card">
            <Table>
              <TableHead>
                <TableRow>
                  {['NAME', 'DESCRIPTION', 'SORT ORDER', 'ACTIONS'].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: '#0099dd',
                        textShadow: '0 0 5px #0099dd',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace' }}>
                      {category.name}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {category.description || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {category.sortOrder || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openCategoryDialog(category)}
                        sx={{ color: '#ffaa00', '&:hover': { color: '#ffcc00', backgroundColor: 'rgba(255, 170, 0, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDelete('category', category.id, category.name)}
                        sx={{ color: '#ff4444', '&:hover': { color: '#ff6666', backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ textAlign: 'center', color: '#666666', fontFamily: '"Share Tech Mono", monospace', py: 4 }}
                    >
                      NO CATEGORIES FOUND - ADD YOUR FIRST CATEGORY
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* LOCATIONS TAB */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 15px #0099dd, 0 0 30px #0099dd',
                fontFamily: '"VT323", monospace',
              }}
            >
              {'>'} Storage Locations
            </Typography>
            <Button startIcon={<AddIcon />} className="terminal-button" onClick={() => openLocationDialog()}>
              ADD LOCATION
            </Button>
          </Box>

          <TableContainer component={Paper} className="terminal-card">
            <Table>
              <TableHead>
                <TableRow>
                  {['NAME', 'DESCRIPTION', 'ACTIONS'].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: '#0099dd',
                        textShadow: '0 0 5px #0099dd',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id} hover>
                    <TableCell sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace' }}>
                      {location.name}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {location.description || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openLocationDialog(location)}
                        sx={{ color: '#ffaa00', '&:hover': { color: '#ffcc00', backgroundColor: 'rgba(255, 170, 0, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDelete('location', location.id, location.name)}
                        sx={{ color: '#ff4444', '&:hover': { color: '#ff6666', backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {locations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      sx={{ textAlign: 'center', color: '#666666', fontFamily: '"Share Tech Mono", monospace', py: 4 }}
                    >
                      NO LOCATIONS FOUND - ADD YOUR FIRST LOCATION
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* SUPPLIERS TAB */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#0099dd',
                textShadow: '0 0 15px #0099dd, 0 0 30px #0099dd',
                fontFamily: '"VT323", monospace',
              }}
            >
              {'>'} Suppliers
            </Typography>
            <Button startIcon={<AddIcon />} className="terminal-button" onClick={() => openSupplierDialog()}>
              ADD SUPPLIER
            </Button>
          </Box>

          <TableContainer component={Paper} className="terminal-card">
            <Table>
              <TableHead>
                <TableRow>
                  {['NAME', 'EMAIL', 'PHONE', 'ACTIONS'].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: '#0099dd',
                        textShadow: '0 0 5px #0099dd',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace' }}>
                      {supplier.name}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {supplier.contactEmail || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', fontFamily: '"Share Tech Mono", monospace' }}>
                      {supplier.phone || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openSupplierDialog(supplier)}
                        sx={{ color: '#ffaa00', '&:hover': { color: '#ffcc00', backgroundColor: 'rgba(255, 170, 0, 0.1)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => confirmDelete('supplier', supplier.id, supplier.name)}
                        sx={{ color: '#ff4444', '&:hover': { color: '#ff6666', backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ textAlign: 'center', color: '#666666', fontFamily: '"Share Tech Mono", monospace', py: 4 }}
                    >
                      NO SUPPLIERS FOUND - ADD YOUR FIRST SUPPLIER
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* LOCATION DIALOG */}
      <Dialog
        open={locationDialogOpen}
        onClose={closeLocationDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'terminal-card',
          sx: { backgroundColor: '#0a1929' },
        }}
      >
        <DialogTitle sx={{ color: '#0099dd', textShadow: '0 0 10px #0099dd', fontFamily: '"VT323", monospace' }}>
          {editingLocation ? 'EDIT LOCATION' : 'ADD LOCATION'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="LOCATION NAME *"
              value={locationForm.name}
              onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="DESCRIPTION"
              value={locationForm.description}
              onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
              className="terminal-input"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeLocationDialog} className="terminal-button" sx={{ color: '#cccccc', borderColor: '#cccccc' }}>
            CANCEL
          </Button>
          <Button
            onClick={saveLocation}
            className="terminal-button"
            disabled={locationSaving || !locationForm.name.trim()}
          >
            {locationSaving ? 'SAVING...' : editingLocation ? 'UPDATE' : 'CREATE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUPPLIER DIALOG */}
      <Dialog
        open={supplierDialogOpen}
        onClose={closeSupplierDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'terminal-card',
          sx: { backgroundColor: '#0a1929' },
        }}
      >
        <DialogTitle sx={{ color: '#0099dd', textShadow: '0 0 10px #0099dd', fontFamily: '"VT323", monospace' }}>
          {editingSupplier ? 'EDIT SUPPLIER' : 'ADD SUPPLIER'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="SUPPLIER NAME *"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="CONTACT EMAIL"
              type="email"
              value={supplierForm.contactEmail}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="PHONE NUMBER"
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="NOTES"
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, notes: e.target.value }))}
              className="terminal-input"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeSupplierDialog} className="terminal-button" sx={{ color: '#cccccc', borderColor: '#cccccc' }}>
            CANCEL
          </Button>
          <Button
            onClick={saveSupplier}
            className="terminal-button"
            disabled={supplierSaving || !supplierForm.name.trim()}
          >
            {supplierSaving ? 'SAVING...' : editingSupplier ? 'UPDATE' : 'CREATE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ITEM DIALOG */}
      <Dialog
        open={itemDialogOpen}
        onClose={closeItemDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'terminal-card',
          sx: { backgroundColor: '#0a1929' },
        }}
      >
        <DialogTitle sx={{ color: '#0099dd', textShadow: '0 0 10px #0099dd', fontFamily: '"VT323", monospace' }}>
          {editingItem ? 'EDIT ITEM' : 'ADD NEW ITEM'}
        </DialogTitle>
        <DialogContent>
          {itemFormError && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444' }}>
              {itemFormError}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="ITEM NAME *"
              value={itemForm.name}
              onChange={(e) => handleItemFormChange('name', e.target.value)}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="SKU (Optional)"
              value={itemForm.sku}
              onChange={(e) => handleItemFormChange('sku', e.target.value)}
              className="terminal-input"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#cccccc', '&.Mui-focused': { color: '#0099dd' } }}>CATEGORY *</InputLabel>
              <Select
                value={itemForm.categoryId}
                label="CATEGORY *"
                onChange={(e) => handleItemFormChange('categoryId', e.target.value)}
                className="terminal-input"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="UNIT OF MEASURE"
              value={itemForm.unitOfMeasure}
              onChange={(e) => handleItemFormChange('unitOfMeasure', e.target.value)}
              className="terminal-input"
              fullWidth
              placeholder="e.g., pcs, boxes, liters"
            />
            <TextField
              label="CURRENT QUANTITY (Actual Amount)"
              type="number"
              value={itemForm.currentQuantity}
              onChange={(e) => handleItemFormChange('currentQuantity', e.target.value)}
              className="terminal-input"
              fullWidth
              helperText="How many you have right now"
            />
            <TextField
              label="MINIMUM QUANTITY (Trigger Amount)"
              type="number"
              value={itemForm.minimumQuantity}
              onChange={(e) => handleItemFormChange('minimumQuantity', e.target.value)}
              className="terminal-input"
              fullWidth
              helperText="Triggers LOW STOCK notification"
            />
            <TextField
              label="REORDER QUANTITY (Target/Fixed Amount)"
              type="number"
              value={itemForm.reorderQuantity}
              onChange={(e) => handleItemFormChange('reorderQuantity', e.target.value)}
              className="terminal-input"
              fullWidth
              helperText="Ideal stock level to maintain"
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#cccccc', '&.Mui-focused': { color: '#0099dd' } }}>LOCATION</InputLabel>
              <Select
                value={itemForm.locationId}
                label="LOCATION"
                onChange={(e) => handleItemFormChange('locationId', e.target.value)}
                className="terminal-input"
              >
                <MenuItem value="">None</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#cccccc', '&.Mui-focused': { color: '#0099dd' } }}>SUPPLIER</InputLabel>
              <Select
                value={itemForm.supplierId}
                label="SUPPLIER"
                onChange={(e) => handleItemFormChange('supplierId', e.target.value)}
                className="terminal-input"
              >
                <MenuItem value="">None</MenuItem>
                {suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="NOTIFICATION EMAILS"
            value={itemForm.notificationEmails}
            onChange={(e) => handleItemFormChange('notificationEmails', e.target.value)}
            className="terminal-input"
            fullWidth
            sx={{ mt: 2 }}
            placeholder="email1@example.com, email2@example.com"
            helperText="Comma-separated emails to notify when stock is low. These will receive alerts until you change/remove them."
          />

          <TextField
            label="NOTES"
            value={itemForm.notes}
            onChange={(e) => handleItemFormChange('notes', e.target.value)}
            className="terminal-input"
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeItemDialog} className="terminal-button" sx={{ color: '#cccccc', borderColor: '#cccccc' }}>
            CANCEL
          </Button>
          <Button
            onClick={saveItem}
            className="terminal-button"
            disabled={itemSaving}
            startIcon={itemSaving ? <CircularProgress size={16} /> : null}
          >
            {itemSaving ? 'SAVING...' : editingItem ? 'UPDATE ITEM' : 'CREATE ITEM'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CATEGORY DIALOG */}
      <Dialog
        open={categoryDialogOpen}
        onClose={closeCategoryDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'terminal-card',
          sx: { backgroundColor: '#0a1929' },
        }}
      >
        <DialogTitle sx={{ color: '#0099dd', textShadow: '0 0 10px #0099dd', fontFamily: '"VT323", monospace' }}>
          {editingCategory ? 'EDIT CATEGORY' : 'ADD CATEGORY'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="CATEGORY NAME *"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
            <TextField
              label="DESCRIPTION"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              className="terminal-input"
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="SORT ORDER"
              type="number"
              value={categoryForm.sortOrder}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="terminal-input"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeCategoryDialog} className="terminal-button" sx={{ color: '#cccccc', borderColor: '#cccccc' }}>
            CANCEL
          </Button>
          <Button
            onClick={saveCategory}
            className="terminal-button"
            disabled={categorySaving || !categoryForm.name.trim()}
          >
            {categorySaving ? 'SAVING...' : editingCategory ? 'UPDATE' : 'CREATE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: 'terminal-card',
          sx: { backgroundColor: '#0a1929' },
        }}
      >
        <DialogTitle sx={{ color: '#ff4444', fontFamily: '"VT323", monospace' }}>
          CONFIRM DELETE
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ffffff', fontFamily: '"Share Tech Mono", monospace' }}>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </Typography>
          <Typography sx={{ color: '#ff4444', fontFamily: '"Share Tech Mono", monospace', mt: 1, fontSize: '0.875rem' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} className="terminal-button" sx={{ color: '#cccccc', borderColor: '#cccccc' }}>
            CANCEL
          </Button>
          <Button
            onClick={executeDelete}
            className="terminal-button"
            sx={{ color: '#ff4444', borderColor: '#ff4444', '&:hover': { backgroundColor: 'rgba(255, 68, 68, 0.1)' } }}
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
