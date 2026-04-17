export function todayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ar-JO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ar-JO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatPhoneHref(value?: string | null) {
  if (!value) return '#';
  return `tel:${value.replace(/\s+/g, '')}`;
}

export function formatWhatsappHref(value?: string | null) {
  if (!value) return '#';
  const normalized = value.replace(/[^\d+]/g, '');
  return `https://wa.me/${normalized.replace(/^\+/, '')}`;
}
