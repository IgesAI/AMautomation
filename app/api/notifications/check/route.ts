import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { checkAllItemsForExpiringSoon, checkAllItemsForLowStock, forceSendNotificationsForCurrentStatus } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    const body = await request.json().catch(() => ({}))
    const forceSend = body.forceSend === true

    if (forceSend) {
      // Force send notifications for items currently in low/out-of-stock state
      const sentCount = await forceSendNotificationsForCurrentStatus(true, true)
      return NextResponse.json({
        success: true,
        message: `Force notification check completed. Sent ${sentCount} notification(s) for items currently in low/out-of-stock state.`,
        sentCount,
      })
    } else {
      // Normal check - only sends notifications for status changes
      await Promise.all([
        checkAllItemsForExpiringSoon(),
        checkAllItemsForLowStock(),
      ])

      return NextResponse.json({
        success: true,
        message: 'Notification check completed. Any items that changed status will trigger notifications.',
      })
    }
  } catch (error) {
    console.error('Notification check error:', error)
    return NextResponse.json(
      { error: 'Failed to run notification check' },
      { status: 500 }
    )
  }
}

