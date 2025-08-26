import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Email validation regex pattern
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// WhatsApp validation regex patterns for Brazilian phone numbers
export const WHATSAPP_REGEX = {
  // Matches formats like: (11) 99999-9999, 11999999999, +55 11 99999-9999
  BRAZILIAN: /^(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/,
  
  // Matches only digits (for cleaning)
  DIGITS_ONLY: /^\d+$/,
  
  // Matches common Brazilian phone formats
  FORMATTED: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates Brazilian WhatsApp/phone number format
 * @param whatsapp - Phone number string to validate
 * @returns boolean indicating if phone number is valid
 */
export function isValidWhatsApp(whatsapp: string): boolean {
  if (!whatsapp || typeof whatsapp !== 'string') return false;
  
  const cleanNumber = whatsapp.trim();
  
  // Check if it matches Brazilian phone format
  return WHATSAPP_REGEX.BRAZILIAN.test(cleanNumber);
}

/**
 * Formats WhatsApp number to Brazilian standard format
 * @param whatsapp - Phone number string to format
 * @returns formatted phone number or null if invalid
 */
export function formatWhatsApp(whatsapp: string): string | null {
  if (!isValidWhatsApp(whatsapp)) return null;
  
  // Remove all non-digit characters
  const digitsOnly = whatsapp.replace(/\D/g, '');
  
  // Handle different input formats
  if (digitsOnly.length === 11) {
    // Format: 11999999999 -> (11) 99999-9999
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('55')) {
    // Format: 5511999999999 -> (11) 99999-9999
    return `(${digitsOnly.slice(2, 4)}) ${digitsOnly.slice(4, 9)}-${digitsOnly.slice(9)}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('55')) {
    // Format: 551199999999 -> (11) 99999-9999
    return `(${digitsOnly.slice(2, 4)}) ${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8)}`;
  }
  
  return null;
}

/**
 * Cleans WhatsApp number to digits only
 * @param whatsapp - Phone number string to clean
 * @returns digits only or null if invalid
 */
export function cleanWhatsApp(whatsapp: string): string | null {
  if (!isValidWhatsApp(whatsapp)) return null;
  
  const digitsOnly = whatsapp.replace(/\D/g, '');
  
  // Remove country code if present and return 11 digits
  if (digitsOnly.length === 13 && digitsOnly.startsWith('55')) {
    return digitsOnly.slice(2);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('55')) {
    return digitsOnly.slice(2);
  } else if (digitsOnly.length === 11) {
    return digitsOnly;
  }
  
  return null;
}

/**
 * Validates and formats both email and WhatsApp
 * @param email - Email string to validate
 * @param whatsapp - WhatsApp string to validate and format
 * @returns object with validation results and formatted values
 */
export function validateContactInfo(email: string, whatsapp: string) {
  const emailValid = isValidEmail(email);
  const whatsappValid = isValidWhatsApp(whatsapp);
  const formattedWhatsApp = whatsappValid ? formatWhatsApp(whatsapp) : null;
  
  return {
    emailValid,
    whatsappValid,
    formattedWhatsApp,
    isValid: emailValid && whatsappValid
  };
}
