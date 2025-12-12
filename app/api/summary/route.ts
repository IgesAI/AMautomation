import { NextRequest, NextResponse } from 'next/server'
import { getDashboardSummary } from '@/lib/item-utils'

export async function GET(request: NextRequest) {
  try {
    const summary = await getDashboardSummary()

    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
