/**
 * Client-side validation utilities.
 * These validations match the server-side rules in Server/utils/validation.ts
 * for consistent UX (client validates for feedback, server enforces for security).
 */

export const NAME_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 1;
export const NAME_REGEX = /^[\p{L}\s\-']+$/u;

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN_LENGTH) {
        return { valid: false, error: 'Name cannot be empty' };
    }
    if (trimmed.length > NAME_MAX_LENGTH) {
        return { valid: false, error: `Name cannot exceed ${NAME_MAX_LENGTH} characters` };
    }
    if (!NAME_REGEX.test(trimmed)) {
        return { valid: false, error: 'Names can only contain letters (any language), spaces, hyphens, and apostrophes' };
    }
    return { valid: true };
}
