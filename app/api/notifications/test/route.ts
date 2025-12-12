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
          error: 'SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.' 
        },
        { status: 500 }
      )
    }

    const result = await sendTestNotification(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}

