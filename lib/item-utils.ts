import { ConsumableItem, ItemStatus } from '@prisma/client'
import { prisma } from './db'
import { differenceInDays } from 'date-fns'

export type ItemWithRelations = ConsumableItem & {
  category: { name: string }
  location?: { name: string } | null
  supplier?: { name: string } | null
}

export function calculateItemStatus(item: ConsumableItem): ItemStatus {
  // Check if out of stock
  if (item.currentQuantity <= 0) {
    return ItemStatus.OUT_OF_STOCK
  }

  // Check if low stock
  if (item.currentQuantity <= item.minimumQuantity) {
    return ItemStatus.LOW
  }

  // Check if expiring soon (if expiration date is set)
  if (item.expirationDate) {
    const daysUntilExpiry = differenceInDays(item.expirationDate, new Date())
    if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
      return ItemStatus.EXPIRING_SOON
    }
  }

  return ItemStatus.OK
}

export function getStatusColor(status: ItemStatus): string {
  switch (status) {
    case ItemStatus.OK:
      return '#00ff00'
    case ItemStatus.LOW:
      return '#ffaa00'
    case ItemStatus.OUT_OF_STOCK:
      return '#ff4444'
    case ItemStatus.EXPIRING_SOON:
      return '#ff00ff'
    default:
      return '#ffffff'
  }
}

export function getStatusLabel(status: ItemStatus): string {
  switch (status) {
    case ItemStatus.OK:
      return 'OK'
    case ItemStatus.LOW:
      return 'LOW'
    case ItemStatus.OUT_OF_STOCK:
      return 'OUT OF STOCK'
    case ItemStatus.EXPIRING_SOON:
      return 'EXPIRING SOON'
    default:
      return 'UNKNOWN'
  }
}

export async function getItemWithStatus(id: string): Promise<ItemWithRelations & { status: ItemStatus } | null> {
  const item = await prisma.consumableItem.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      location: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  })

  if (!item) return null

  const status = calculateItemStatus(item)
  return { ...item, status }
}

export async function getItemsWithStatus(filters?: {
  status?: ItemStatus
  categoryId?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<(ItemWithRelations & { status: ItemStatus })[]> {
  const where: any = {
    isActive: true,
  }

  if (filters?.status) {
    // Filter by calculated status
    switch (filters.status) {
      case ItemStatus.OUT_OF_STOCK:
        where.currentQuantity = { lte: 0 }
        break
      case ItemStatus.LOW:
        where.AND = [
          { currentQuantity: { gt: 0 } },
          { currentQuantity: { lte: prisma.consumableItem.fields.minimumQuantity } }
        ]
        break
      case ItemStatus.EXPIRING_SOON:
        where.expirationDate = {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          gte: new Date()
        }
        break
      case ItemStatus.OK:
        where.AND = [
          { currentQuantity: { gt: prisma.consumableItem.fields.minimumQuantity } },
          {
            OR: [
              { expirationDate: null },
              { expirationDate: { gt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
            ]
          }
        ]
        break
    }
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const items = await prisma.consumableItem.findMany({
    where,
    include: {
      category: { select: { name: true } },
      location: { select: { name: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
  })

  return items.map(item => ({
    ...item,
    status: calculateItemStatus(item),
  }))
}

export async function getDashboardSummary() {
  const [totalItems, lowStockItems, outOfStockItems, expiringSoonItems, recentTransactions] = await Promise.all([
    prisma.consumableItem.count({ where: { isActive: true } }),
    prisma.consumableItem.count({
      where: {
        isActive: true,
        AND: [
          { currentQuantity: { gt: 0 } },
          { currentQuantity: { lte: prisma.consumableItem.fields.minimumQuantity } }
        ]
      }
    }),
    prisma.consumableItem.count({
      where: {
        isActive: true,
        currentQuantity: { lte: 0 }
      }
    }),
    prisma.consumableItem.count({
      where: {
        isActive: true,
        expirationDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date()
        }
      }
    }),
    prisma.inventoryTransaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: { name: true, sku: true, unitOfMeasure: true }
        }
      }
    })
  ])

  return {
    totalItems,
    lowStockItems,
    outOfStockItems,
    expiringSoonItems,
    recentTransactions,
  }
}
