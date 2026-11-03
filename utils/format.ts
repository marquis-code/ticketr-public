export function formatMoney(value: number | null | undefined, currency = 'NGN'): string {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `₦${amount.toLocaleString()}`;
  }
}

export function formatCompactMoney(value: number | null | undefined): string {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`;
  if (Math.abs(amount) >= 1_000) return `₦${(amount / 1_000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `₦${amount.toLocaleString()}`;
}

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
}

export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * 24 * 3600 * 1000],
    ['month', 30 * 24 * 3600 * 1000],
    ['day', 24 * 3600 * 1000],
    ['hour', 3600 * 1000],
    ['minute', 60 * 1000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function daysUntil(value: string | Date | null | undefined): number {
  if (!value) return 0;
  const date = new Date(value);
  return Math.ceil((date.getTime() - Date.now()) / (24 * 3600 * 1000));
}

export function countdownLabel(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / (24 * 3600 * 1000));
  if (days >= 2) return `In ${days} days`;
  const hours = Math.floor(diff / (3600 * 1000));
  if (hours >= 1) return `In ${hours} hour${hours === 1 ? '' : 's'}`;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  return `In ${minutes} min`;
}

export function initials(name: string | null | undefined): string {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function cleanAttendeeName(name: string | null | undefined): string {
  return String(name || '').replace(/\s*\((Male|Female|Guest \d+)\)\s*/gi, ' ').trim();
}

export function statusTone(status: string | null | undefined): 'green' | 'amber' | 'red' | 'ink' | 'muted' {
  switch (String(status || '').toUpperCase()) {
    case 'PAID':
    case 'ISSUED':
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'SENT':
    case 'CHECKED_IN':
      return 'green';
    case 'PENDING':
    case 'AWAITING_APPROVAL':
    case 'PROCESSING':
    case 'PARTIALLY_PAID':
    case 'DRAFT':
    case 'SENDING':
    case 'AVAILABLE':
      return 'amber';
    case 'FAILED':
    case 'CANCELLED':
    case 'REFUNDED':
    case 'SUSPENDED':
      return 'red';
    case 'COMPLETED':
    case 'SOLD':
      return 'ink';
    default:
      return 'muted';
  }
}

export function humanStatus(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  return String(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function pct(value: number | null | undefined, total: number | null | undefined): number {
  const t = Number(total || 0);
  if (!t) return 0;
  return Math.min(100, Math.max(0, Math.round((Number(value || 0) / t) * 100)));
}

export function toLocalInput(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function downloadCalendarFile(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate: string | Date;
  slug?: string;
}) {
  if (typeof window === 'undefined') return;
  const stamp = (d: string | Date) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ticketr//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@ticketr.org`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(event.startDate)}`,
    `DTEND:${stamp(event.endDate)}`,
    `SUMMARY:${(event.title || 'Event').replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, ' ').slice(0, 400)}`,
    `LOCATION:${(event.location || '').replace(/\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(event.slug || 'event').replace(/[^a-z0-9-]/gi, '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
