import { NextRequest, NextResponse } from 'next/server'
import { getItemsWithStatus, ItemStatus } from '@/lib/item-utils'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: Parameters<typeof getItemsWithStatus>[0] = {}

    // Parse query parameters
    const status = searchParams.get('status')
    if (status && Object.values(ItemStatus).includes(status as ItemStatus)) {
      filters.status = status as ItemStatus
    }

    const categoryId = searchParams.get('categoryId')
    if (categoryId) {
      filters.categoryId = categoryId
    }

    const search = searchParams.get('search')
    if (search) {
      filters.search = search
    }

    const limit = searchParams.get('limit')
    if (limit) {
      filters.limit = parseInt(limit)
    }

    const offset = searchParams.get('offset')
    if (offset) {
      filters.offset = parseInt(offset)
    }

    const items = await getItemsWithStatus(filters)

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length
    })
  } catch (error) {
    console.error('Items list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'categoryId', 'currentQuantity', 'minimumQuantity', 'reorderQuantity']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const { prisma } = await import('@/lib/db')

    // Verify category exists
    const category = await prisma.consumableCategory.findUnique({
      where: { id: body.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Create the item
    const item = await prisma.consumableItem.create({
      data: {
        name: body.name,
        sku: body.sku || null,
        categoryId: body.categoryId,
        unitOfMeasure: body.unitOfMeasure || 'pcs',
        currentQuantity: parseFloat(body.currentQuantity),
        minimumQuantity: parseFloat(body.minimumQuantity),
        reorderQuantity: parseFloat(body.reorderQuantity),
        locationId: body.locationId || null,
        supplierId: body.supplierId || null,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        notes: body.notes || null,
      },
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
        supplier: { select: { name: true } },
      }
    })

    // Calculate status for the response
    const { calculateItemStatus } = await import('@/lib/item-utils')
    const status = calculateItemStatus(item)

    return NextResponse.json({
      success: true,
      data: { ...item, status }
    })
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
