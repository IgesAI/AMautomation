import { NextRequest, NextResponse } from 'next/server'
import { TransactionType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { processItemNotifications } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['itemId', 'type', 'quantity']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate transaction type
    if (!Object.values(TransactionType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      )
    }

    const quantity = parseFloat(body.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Verify item exists and is active
    const item = await prisma.consumableItem.findUnique({
      where: { id: body.itemId, isActive: true }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found or inactive' },
        { status: 404 }
      )
    }

    // Calculate quantity change based on transaction type
    let quantityChange: number
    switch (body.type) {
      case TransactionType.ADD_STOCK:
        quantityChange = quantity
        break
      case TransactionType.CONSUME:
        quantityChange = -quantity
        // Check if there's enough stock
        if (item.currentQuantity < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock. Current: ${item.currentQuantity}, Requested: ${quantity}` },
            { status: 400 }
          )
        }
        break
      case TransactionType.ADJUSTMENT:
        // For adjustments, quantity can be positive or negative
        quantityChange = quantity
        break
      default:
        return NextResponse.json(
          { error: 'Invalid transaction type' },
          { status: 400 }
        )
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update item quantity
      const updatedItem = await tx.consumableItem.update({
        where: { id: body.itemId },
        data: {
          currentQuantity: {
            increment: quantityChange
          }
        },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
          supplier: { select: { name: true } },
        }
      })

      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId: body.itemId,
          type: body.type,
          quantityChange: quantityChange,
          performedBy: body.performedBy || null,
          machineOrArea: body.machineOrArea || null,
          jobReference: body.jobReference || null,
          notes: body.notes || null,
        },
        include: {
          item: {
            select: { name: true, sku: true, unitOfMeasure: true }
          }
        }
      })

      return { updatedItem, transaction }
    })

    // Process notifications asynchronously (don't wait for it)
    processItemNotifications(result.updatedItem).catch(error => {
      console.error('Notification processing failed:', error)
    })

    // Calculate new status for response
    const { calculateItemStatus } = await import('@/lib/item-utils')
    const newStatus = calculateItemStatus(result.updatedItem)

    return NextResponse.json({
      success: true,
      data: {
        transaction: result.transaction,
        item: {
          ...result.updatedItem,
          status: newStatus
        }
      }
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const where: any = {}

    // Parse query parameters
    const itemId = searchParams.get('itemId')
    if (itemId) {
      where.itemId = itemId
    }

    const type = searchParams.get('type')
    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      where.type = type
    }

    const performedBy = searchParams.get('performedBy')
    if (performedBy) {
      where.performedBy = {
        contains: performedBy,
        mode: 'insensitive'
      }
    }

    const machineOrArea = searchParams.get('machineOrArea')
    if (machineOrArea) {
      where.machineOrArea = {
        contains: machineOrArea,
        mode: 'insensitive'
      }
    }

    const jobReference = searchParams.get('jobReference')
    if (jobReference) {
      where.jobReference = {
        contains: jobReference,
        mode: 'insensitive'
      }
    }

    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: {
          select: {
            name: true,
            sku: true,
            unitOfMeasure: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
    })

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
