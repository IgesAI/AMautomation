import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { checkAllItemsForExpiringSoon, checkAllItemsForLowStock } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    // Run both notification checks
    await Promise.all([
      checkAllItemsForExpiringSoon(),
      checkAllItemsForLowStock(),
    ])

    return NextResponse.json({
      success: true,
      message: 'Notification check completed. Any items that changed status will trigger notifications.',
    })
  } catch (error) {
    console.error('Notification check error:', error)
    return NextResponse.json(
      { error: 'Failed to run notification check' },
      { status: 500 }
    )
  }
}

