import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    const where: { isActive: boolean; itemId?: string } = { isActive: true }
    if (itemId) {
      where.itemId = itemId
    }

    const rules = await prisma.notificationRule.findMany({
      where,
      include: {
        item: { select: { name: true, sku: true } },
        category: { select: { name: true } },
      },
      orderBy: { priority: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('Notification rules fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification rules' },
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
    if (!body.emails || !Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email recipient is required' },
        { status: 400 }
      )
    }

    // Validate that either itemId or categoryId is provided, but not both
    if ((!body.itemId && !body.categoryId) || (body.itemId && body.categoryId)) {
      return NextResponse.json(
        { error: 'Must specify either itemId OR categoryId, but not both' },
        { status: 400 }
      )
    }

    // Verify item exists if specified
    if (body.itemId) {
      const item = await prisma.consumableItem.findUnique({
        where: { id: body.itemId }
      })
      if (!item) {
        return NextResponse.json(
          { error: 'Invalid item ID' },
          { status: 400 }
        )
      }

      // Check if a rule already exists for this item - if so, update it
      const existingRule = await prisma.notificationRule.findFirst({
        where: { itemId: body.itemId }
      })

      if (existingRule) {
        const updatedRule = await prisma.notificationRule.update({
          where: { id: existingRule.id },
          data: {
            emails: body.emails,
            notifyOnLowStock: body.notifyOnLowStock !== undefined ? body.notifyOnLowStock : true,
            notifyOnOutOfStock: body.notifyOnOutOfStock !== undefined ? body.notifyOnOutOfStock : true,
            notifyOnExpiringSoon: body.notifyOnExpiringSoon !== undefined ? body.notifyOnExpiringSoon : true,
            expiringSoonDays: body.expiringSoonDays || 30,
            isActive: body.isActive !== undefined ? body.isActive : true,
          },
          include: {
            item: { select: { name: true, sku: true } },
            category: { select: { name: true } },
          }
        })

        return NextResponse.json({
          success: true,
          data: updatedRule
        })
      }
    }

    // Verify category exists if specified
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

    // Create the rule
    const rule = await prisma.notificationRule.create({
      data: {
        itemId: body.itemId || null,
        categoryId: body.categoryId || null,
        emails: body.emails,
        notifyOnLowStock: body.notifyOnLowStock !== undefined ? body.notifyOnLowStock : true,
        notifyOnOutOfStock: body.notifyOnOutOfStock !== undefined ? body.notifyOnOutOfStock : true,
        notifyOnExpiringSoon: body.notifyOnExpiringSoon !== undefined ? body.notifyOnExpiringSoon : true,
        expiringSoonDays: body.expiringSoonDays || 30,
        isActive: body.isActive !== undefined ? body.isActive : true,
        priority: body.priority || 0,
      },
      include: {
        item: { select: { name: true, sku: true } },
        category: { select: { name: true } },
      }
    })

    return NextResponse.json({
      success: true,
      data: rule
    })
  } catch (error) {
    console.error('Create notification rule error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification rule' },
      { status: 500 }
    )
  }
}
