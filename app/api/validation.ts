// Validation utilities for API requests

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation (at least 8 characters, one uppercase, one lowercase, one number)
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
}

// File validation
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedTypes.includes(fileExtension);
}

export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Validate analysis request
export function validateAnalysisRequest(title: string, message: string, fileIds: string[]): string | null {
  if (!title.trim()) {
    return 'Title is required';
  }
  
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  
  if (message && message.length > 1000) {
    return 'Message must be less than 1000 characters';
  }
  
  if (fileIds.length === 0) {
    return 'At least one file is required';
  }
  
  return null; // No validation errors
}

// Validate user input for search
export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could be used for injection
  return query.replace(/[^\w\s]/gi, '');
}