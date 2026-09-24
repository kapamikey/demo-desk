import type { Request, Response, NextFunction } from 'express'
import { getEnv } from '../db/client.js'

const COOKIE = 'demo_desk_op'

export function isOperator(req: Request): boolean {
  const secret = getEnv().operatorSecret
  if (!secret) return false
  const header = req.get('x-operator-secret')
  if (header && header === secret) return true
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[COOKIE]
  return cookie === secret
}

export function requireOperator(req: Request, res: Response, next: NextFunction): void {
  if (isOperator(req)) {
    next()
    return
  }
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.redirect('/admin/login')
    return
  }
  res.status(401).send('Unauthorized — operator login required')
}

export function setOperatorCookie(res: Response, secret: string): void {
  const secure =
    process.env.VERCEL === '1' ||
    process.env.NODE_ENV === 'production' ||
    process.env.COOKIE_SECURE === '1'
  res.cookie(COOKIE, secret, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearOperatorCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: '/' })
}

export { COOKIE as OPERATOR_COOKIE }
