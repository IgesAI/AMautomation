import { NextRequest, NextResponse } from 'next/server'
import { getItemWithStatus } from '@/lib/item-utils'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getItemWithStatus(params.id)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Get item error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    const body = await request.json()
    const { prisma } = await import('@/lib/db')

    // Check if item exists
    const existingItem = await prisma.consumableItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify category exists if provided
    if (body.categoryId) {
      const category = await prisma.consumableCategory.findUnique({
        where: { id: body.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        )
      }
    }

    // Update the item
    const updatedItem = await prisma.consumableItem.update({
      where: { id: params.id },
      data: {
        name: body.name,
        sku: body.sku,
        categoryId: body.categoryId,
        unitOfMeasure: body.unitOfMeasure,
        currentQuantity: body.currentQuantity !== undefined ? parseFloat(body.currentQuantity) : undefined,
        minimumQuantity: body.minimumQuantity !== undefined ? parseFloat(body.minimumQuantity) : undefined,
        reorderQuantity: body.reorderQuantity !== undefined ? parseFloat(body.reorderQuantity) : undefined,
        locationId: body.locationId,
        supplierId: body.supplierId,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        isActive: body.isActive,
        notes: body.notes,
      },
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
        supplier: { select: { name: true } },
      }
    })

    // Calculate status for the response
    const { calculateItemStatus } = await import('@/lib/item-utils')
    const status = calculateItemStatus(updatedItem)

    return NextResponse.json({
      success: true,
      data: { ...updatedItem, status }
    })
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { prisma } = await import('@/lib/db')

    // Check if item exists
    const existingItem = await prisma.consumableItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.consumableItem.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Item deactivated successfully'
    })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
