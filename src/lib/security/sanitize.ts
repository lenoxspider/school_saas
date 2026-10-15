/**
 * Security and sanitization utility functions for ScholarGrid
 */

/**
 * Sanitizes a string against CSV/Excel formula injection (CWE-1236).
 * Prepends a single quote if the field begins with =, +, -, @, \t, or \r.
 */
export function sanitizeCsvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Sanitizes user input against Cross-Site Scripting (XSS)
 * Escapes <, >, &, ", and ' characters for safe HTML rendering.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes admission numbers to permit only alphanumeric and standard delimiter chars.
 */
export function sanitizeAdmissionNumber(input: string): string {
  // Strip dangerous characters, allow A-Z, 0-9, dash, underscore, forward slash
  return input.trim().replace(/[^a-zA-Z0-9\-_/]/g, '').toUpperCase();
}
