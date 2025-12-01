// ============================================
// TradingHub Pro - Security Headers Configuration
// Content Security Policy and other security headers
// ============================================

/**
 * Content Security Policy directives
 * Customize these based on your deployment needs
 */
export const cspDirectives = {
  // Default policy for fallback
  'default-src': ["'self'"],
  
  // Scripts - self and trusted CDNs only
  'script-src': [
    "'self'",
    // Allow inline scripts for Vite HMR in development
    ...(import.meta.env.DEV ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
  ],
  
  // Styles - self and inline (needed for CSS-in-JS and Tailwind)
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and most CSS solutions
  ],
  
  // Images - self and data URIs for inline images
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:', // Allow HTTPS images
  ],
  
  // Fonts
  'font-src': [
    "'self'",
    'data:',
  ],
  
  // API connections
  'connect-src': [
    "'self'",
    'https://api.binance.com',
    'wss://stream.binance.com:9443',
    'https://api.coingecko.com',
    // Vite HMR websocket
    ...(import.meta.env.DEV ? ['ws://localhost:*', 'wss://localhost:*'] : []),
  ],
  
  // Media (if any)
  'media-src': ["'self'"],
  
  // Object/embed tags - disabled
  'object-src': ["'none'"],
  
  // Frame ancestors - prevent clickjacking
  'frame-ancestors': ["'none'"],
  
  // Form submissions
  'form-action': ["'self'"],
  
  // Base URI
  'base-uri': ["'self'"],
  
  // Upgrade insecure requests in production
  ...(import.meta.env.PROD ? { 'upgrade-insecure-requests': [] } : {}),
} as const

/**
 * Build CSP header string from directives
 */
export function buildCspHeader(): string {
  return Object.entries(cspDirectives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive
      }
      return `${directive} ${values.join(' ')}`
    })
    .join('; ')
}

/**
 * Security headers to include in responses
 * Use these in your server configuration or middleware
 */
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': buildCspHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS Protection (legacy, but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),
  
  // Strict Transport Security (enable in production with HTTPS)
  ...(import.meta.env.PROD ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  } : {}),
} as const

/**
 * Generate a random nonce for inline scripts
 * Use this with CSP 'script-src' to allow specific inline scripts
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * Validate that a URL is in the allowed origins list
 */
export function isAllowedOrigin(url: string): boolean {
  try {
    const parsed = new URL(url)
    const connectSrc = cspDirectives['connect-src']
    
    return connectSrc.some(allowed => {
      if (allowed === "'self'") {
        return parsed.origin === window.location.origin
      }
      // Handle wildcards and exact matches
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*')
        return new RegExp(`^${pattern}$`).test(parsed.origin)
      }
      return parsed.origin === allowed || parsed.href.startsWith(allowed)
    })
  } catch {
    return false
  }
}

/**
 * Log security headers for debugging (development only)
 */
export function logSecurityConfig(): void {
  if (!import.meta.env.DEV) return
  
  console.group('🔐 Security Configuration')
  console.log('CSP:', buildCspHeader())
  console.log('Headers:', securityHeaders)
  console.groupEnd()
}
