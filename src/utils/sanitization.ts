/**
 * Sanitizes user input to prevent XSS and code injection
 * Removes HTML tags and potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  let sanitized = input;

  // Remove script tags and their content (must be done before removing other tags)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (before removing tags to catch inline handlers)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:[^"\s]*/gi, '');

  // Remove data: protocol and everything after it until whitespace or quote
  sanitized = sanitized.replace(/data:[^"\s]*/gi, '');

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Validates that input doesn't contain potentially dangerous patterns
 */
export const isValidTextInput = (input: string): boolean => {
  if (!input) return true;

  // Check for script tags
  if (/<script/i.test(input)) return false;

  // Check for event handlers
  if (/on\w+\s*=/i.test(input)) return false;

  // Check for javascript: protocol
  if (/javascript:/i.test(input)) return false;

  // Check for data: protocol
  if (/data:/i.test(input)) return false;

  return true;
};
