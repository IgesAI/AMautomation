import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const location = await prisma.location.findUnique({
      where: { id },
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: location })
  } catch (error) {
    console.error('Location fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { id } = await params
    const body = await request.json()
    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, data: location })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request)
    if (authError) return authError

    const { id } = await params

    // Check if location has any items
    const itemCount = await prisma.consumableItem.count({
      where: { locationId: id },
    })

    if (itemCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete location - it has ${itemCount} item(s). Reassign items first.` },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Location delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}

