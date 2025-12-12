import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const COOKIE_NAME = 'admin_token'

export interface AdminUser {
  id: string
  role: 'admin'
  iat?: number
  exp?: number
}

export function generateAdminToken(): string {
  const payload: AdminUser = {
    id: 'admin',
    role: 'admin',
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  return verifyAdminToken(token)
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  return null // Authorized
}

export async function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
}

export async function clearAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

export function validateAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.warn('ADMIN_PASSWORD not set in environment variables')
    return false
  }
  return password === adminPassword
}
