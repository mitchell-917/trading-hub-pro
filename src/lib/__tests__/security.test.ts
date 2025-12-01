// ============================================
// TradingHub Pro - Security Configuration Tests
// ============================================

import { describe, it, expect } from 'vitest'
import {
  cspDirectives,
  buildCspHeader,
  securityHeaders,
  generateNonce,
  isAllowedOrigin,
} from '../security'

describe('Security Configuration', () => {
  describe('cspDirectives', () => {
    it('should have default-src directive', () => {
      expect(cspDirectives['default-src']).toBeDefined()
      expect(cspDirectives['default-src']).toContain("'self'")
    })

    it('should have script-src directive', () => {
      expect(cspDirectives['script-src']).toBeDefined()
      expect(cspDirectives['script-src']).toContain("'self'")
    })

    it('should have connect-src directive', () => {
      expect(cspDirectives['connect-src']).toBeDefined()
      expect(cspDirectives['connect-src']).toContain("'self'")
    })

    it('should allow Binance API', () => {
      expect(cspDirectives['connect-src']).toContain('https://api.binance.com')
    })

    it('should allow Binance WebSocket', () => {
      expect(cspDirectives['connect-src']).toContain('wss://stream.binance.com:9443')
    })

    it('should disable object-src', () => {
      expect(cspDirectives['object-src']).toContain("'none'")
    })

    it('should disable frame-ancestors', () => {
      expect(cspDirectives['frame-ancestors']).toContain("'none'")
    })
  })

  describe('buildCspHeader', () => {
    it('should return string', () => {
      const header = buildCspHeader()
      expect(typeof header).toBe('string')
    })

    it('should include default-src', () => {
      const header = buildCspHeader()
      expect(header).toContain('default-src')
    })

    it('should include script-src', () => {
      const header = buildCspHeader()
      expect(header).toContain('script-src')
    })

    it('should separate directives with semicolons', () => {
      const header = buildCspHeader()
      expect(header).toContain(';')
    })

    it('should have properly formatted directives', () => {
      const header = buildCspHeader()
      // Each directive should have format: directive-name values
      expect(header).toMatch(/default-src\s+'self'/)
    })
  })

  describe('securityHeaders', () => {
    it('should have Content-Security-Policy', () => {
      expect(securityHeaders['Content-Security-Policy']).toBeDefined()
    })

    it('should have X-Content-Type-Options', () => {
      expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff')
    })

    it('should have X-Frame-Options', () => {
      expect(securityHeaders['X-Frame-Options']).toBe('DENY')
    })

    it('should have X-XSS-Protection', () => {
      expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block')
    })

    it('should have Referrer-Policy', () => {
      expect(securityHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    })

    it('should have Permissions-Policy', () => {
      expect(securityHeaders['Permissions-Policy']).toBeDefined()
      expect(securityHeaders['Permissions-Policy']).toContain('camera=()')
    })
  })

  describe('generateNonce', () => {
    it('should return string', () => {
      const nonce = generateNonce()
      expect(typeof nonce).toBe('string')
    })

    it('should return base64 encoded string', () => {
      const nonce = generateNonce()
      // Base64 pattern
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })

    it('should have appropriate length', () => {
      const nonce = generateNonce()
      // 16 bytes -> ~24 base64 characters
      expect(nonce.length).toBeGreaterThanOrEqual(20)
      expect(nonce.length).toBeLessThanOrEqual(30)
    })
  })

  describe('isAllowedOrigin', () => {
    it('should allow same origin', () => {
      // Mock window.location.origin
      const result = isAllowedOrigin(window.location.origin)
      expect(result).toBe(true)
    })

    it('should allow Binance API', () => {
      const result = isAllowedOrigin('https://api.binance.com/api/v3')
      expect(result).toBe(true)
    })

    it('should reject unknown origins', () => {
      const result = isAllowedOrigin('https://evil.com')
      expect(result).toBe(false)
    })

    it('should handle invalid URLs gracefully', () => {
      const result = isAllowedOrigin('not-a-url')
      expect(result).toBe(false)
    })

    it('should handle empty string', () => {
      const result = isAllowedOrigin('')
      expect(result).toBe(false)
    })
  })
})
