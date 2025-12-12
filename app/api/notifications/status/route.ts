import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    // Check SMTP configuration
    const smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    )

    // Get recent notification logs
    const recentLogs = await prisma.notificationLog.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
      include: {
        item: {
          select: { name: true, sku: true }
        }
      }
    })

    // Get notification rules count
    const rulesCount = await prisma.notificationRule.count({
      where: { isActive: true }
    })

    // Get default recipients
    const defaultRecipients = process.env.NOTIFY_DEFAULT_RECIPIENTS?.split(',').map(e => e.trim()) || []

    return NextResponse.json({
      success: true,
      data: {
        smtpConfigured,
        smtpHost: process.env.SMTP_HOST || null,
        smtpUser: process.env.SMTP_USER ? '***configured***' : null,
        smtpFrom: process.env.SMTP_FROM || null,
        defaultRecipients,
        activeRulesCount: rulesCount,
        recentLogs: recentLogs.map(log => ({
          id: log.id,
          itemName: log.item.name,
          type: log.notificationType,
          recipients: log.recipients,
          subject: log.subject,
          sentAt: log.sentAt,
          meta: log.meta,
        })),
      },
    })
  } catch (error) {
    console.error('Notification status error:', error)
    return NextResponse.json(
      { error: 'Failed to get notification status' },
      { status: 500 }
    )
  }
}

