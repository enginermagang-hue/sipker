import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SALT_LEN = 16
const KEY_LEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString('hex')
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const test = scryptSync(password, salt, KEY_LEN).toString('hex')
  const testBuf = Buffer.from(test, 'hex')
  const hashBuf = Buffer.from(hash, 'hex')
  if (testBuf.length !== hashBuf.length) return false
  return timingSafeEqual(testBuf, hashBuf)
}