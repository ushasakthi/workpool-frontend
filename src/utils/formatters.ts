export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// "jordan@acme.com" -> "j••••n@acme.com" — keeps the first/last local-part characters as a
// hint, masks the rest. Falls back to the original string when there's nothing safe to mask.
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) {
    return email;
  }

  const masked = `${local[0]}${'•'.repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${masked}@${domain}`;
}
