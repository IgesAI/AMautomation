import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { sendTestNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = await requireAdmin(request)
    if (authError) return authError

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.',
          debug: {
            hasHost: !!process.env.SMTP_HOST,
            hasUser: !!process.env.SMTP_USER,
            hasPass: !!process.env.SMTP_PASS,
          }
        },
        { status: 500 }
      )
    }

    const result = await sendTestNotification(email)

    // Add config debug info to result
    return NextResponse.json({
      ...result,
      debug: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER?.substring(0, 5) + '***',
        smtpPassLength: process.env.SMTP_PASS?.length || 0,
      }
    })
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}

