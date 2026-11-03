export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// "jordan@acme.com" -> "j••••n@acme.com"
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) {
    return email;
  }

  const masked = `${local[0]}${'•'.repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${masked}@${domain}`;
}

// shared fuel cost in rupees, never a fare
export function formatCost(amount: number): string {
  return `LKR ${amount.toLocaleString('en-US')}`;
}

// 0.35 -> "350 m", 1 -> "1 km", 1.24 -> "1.2 km"
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round((km * 1000) / 50) * 50} m`;
  return `${Number(km.toFixed(1))} km`;
}

// 0.94 -> "94%"
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// "Maya Ross" -> "Maya R."
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function formatSeatsLeft(seats: number): string {
  return `${seats} seat${seats === 1 ? '' : 's'} left`;
}

// "today", "yesterday", "3 days ago", "2 weeks ago", "5 months ago"
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

export function daysSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}
