import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful'
  })

  await clearAdminCookie(response)

  return response
}
