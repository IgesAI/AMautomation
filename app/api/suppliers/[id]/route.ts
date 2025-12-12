import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Supplier fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
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
    const { name, contactEmail, phone, defaultLeadTimeDays, notes } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name.trim(),
        contactEmail: contactEmail?.trim() || null,
        phone: phone?.trim() || null,
        defaultLeadTimeDays: defaultLeadTimeDays || null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Supplier update error:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
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

    // Check if supplier has any items
    const itemCount = await prisma.consumableItem.count({
      where: { supplierId: id },
    })

    if (itemCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete supplier - it has ${itemCount} item(s). Reassign items first.` },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Supplier delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}

