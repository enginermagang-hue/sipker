// Tipe data untuk antarmuka pengguna dan entitas aplikasi

// Status langganan pengguna
export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
// Status penjualan/transaksi
export type SaleStatus = 'paid' | 'failed' | 'refunded'

// Antarmuka pengguna dengan profil lengkap
export interface User {
  id: number
  name: string
  email: string
  avatar?: { src?: string; alt?: string }
  status: UserStatus
  location: string
}

// Antarmuka email/pesan
export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

// Antarmuka anggota tim
export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: { src?: string; alt?: string }
}

// Antarmuka statistik untuk dashboard
export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

// Antarmuka penjualan/transaksi
export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

// Antarmuka notifikasi
export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

// Tipe periode waktu untuk filter data
export type Period = 'daily' | 'weekly' | 'monthly'

// Rentang tanggal untuk filter
export interface Range {
  start: Date
  end: Date
}
