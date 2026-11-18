import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format timestamp milidetik ke string tanggal & waktu lokal Indonesia
 */
export function formatTimestamp(timestamp?: number | string | null): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

/**
 * Format durasi detik ke teks mudah dibaca (misal "5 mnt", "1 jam 20 mnt")
 */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '0 dtk'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs} dtk`
  if (secs === 0) return `${mins} mnt`
  return `${mins} mnt ${secs} dtk`
}
