/**
 * Extract user initials from display name or email.
 *
 * Fallback chain:
 * 1. displayName has 2+ words -> first letter of first + last word
 * 2. displayName is a single word -> first letter
 * 3. No displayName -> first character of email (before @)
 * 4. Nothing available -> "?"
 */
export function getInitials(
  displayName: string | null | undefined,
  email: string | null | undefined
): string {
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (email) {
    const local = email.split('@')[0];
    if (local && local.length > 0) {
      return local[0].toUpperCase();
    }
  }

  return '?';
}
