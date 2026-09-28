import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// Panjang salt dalam byte untuk hashing kata sandi
const SALT_LEN = 16
// Panjang kunci hasil hashing dalam byte
const KEY_LEN = 64

// Meng-hash kata sandi menggunakan scrypt dengan salt acak
// Parameter: password - kata sandi teks biasa yang akan di-hash
// Return: string yang berisi salt dan hash yang dipisahkan oleh titik dua (format: salt:hash)
export function hashPassword(password: string): string {
  // Generate salt acak sepanjang SALT_LEN byte
  const salt = randomBytes(SALT_LEN).toString('hex')
  // Hash kata sandi dengan scrypt menggunakan salt dan panjang kunci tertentu
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex')
  // Kembalikan salt dan hash yang digabungkan
  return `${salt}:${hash}`
}

// Memverifikasi kata sandi terhadap hash yang tersimpan
// Parameter: password - kata sandi teks biasa untuk diverifikasi
// Parameter: stored - string hash yang tersimpan (format: salt:hash)
// Return: true jika kata sandi cocok, false jika tidak
export function verifyPassword(password: string, stored: string): boolean {
  // Pisahkan string yang tersimpan menjadi salt dan hash
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  // Hash kata sandi input dengan salt yang sama
  const test = scryptSync(password, salt, KEY_LEN).toString('hex')

  // Konversi kedua hash ke buffer untuk perbandingan yang aman terhadap timing attack
  const testBuf = Buffer.from(test, 'hex')
  const hashBuf = Buffer.from(hash, 'hex')

  // Periksa apakah panjang buffer cocok
  if (testBuf.length !== hashBuf.length) return false

  // Bandingkan hash menggunakan timing-safe equal untuk mencegah side-channel attacks
  return timingSafeEqual(testBuf, hashBuf)
}
