// ============================================
// TradingHub Pro - Environment Validation
// Type-safe environment variable validation using Zod
// ============================================

import { z } from 'zod'

/**
 * Schema for client-side environment variables
 * All VITE_ prefixed variables are exposed to the client
 */
const clientEnvSchema = z.object({
  // Application mode
  VITE_USE_MOCK_DATA: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),
  
  VITE_DEV_TOOLS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  VITE_PERF_MONITORING: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  // Feature flags
  VITE_AI_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),
  
  VITE_REALTIME_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),
  
  // API configuration
  VITE_BINANCE_API_KEY: z.string().optional(),
  
  VITE_BINANCE_WS_URL: z
    .string()
    .url()
    .default('wss://stream.binance.com:9443/ws'),
  
  VITE_BINANCE_REST_URL: z
    .string()
    .url()
    .default('https://api.binance.com/api/v3'),
  
  // Security
  VITE_ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean))
    .default('https://api.binance.com,wss://stream.binance.com'),
  
  // Analytics
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),
  
  // Build
  VITE_GENERATE_SOURCEMAP: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  
  VITE_BUNDLE_ANALYZE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
})

/**
 * Environment configuration type
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>

/**
 * Validated environment configuration
 */
let _env: ClientEnv | null = null

/**
 * Reset environment cache (for testing)
 */
export function resetEnvCache(): void {
  _env = null
}

/**
 * Get validated environment variables
 * Returns defaults if validation fails or in test environment
 */
export function getEnv(): ClientEnv {
  if (_env) return _env
  
  // In test environment, return sensible defaults
  const isTestEnv = typeof import.meta.env.VITEST !== 'undefined' || 
                    import.meta.env.MODE === 'test'
  
  if (isTestEnv) {
    _env = {
      VITE_USE_MOCK_DATA: true,
      VITE_DEV_TOOLS: true,
      VITE_PERF_MONITORING: false,
      VITE_AI_ENABLED: true,
      VITE_REALTIME_ENABLED: true,
      VITE_BINANCE_API_KEY: undefined,
      VITE_BINANCE_WS_URL: 'wss://stream.binance.com:9443/ws',
      VITE_BINANCE_REST_URL: 'https://api.binance.com/api/v3',
      VITE_ALLOWED_ORIGINS: ['https://api.binance.com', 'wss://stream.binance.com'],
      VITE_SENTRY_DSN: undefined,
      VITE_ANALYTICS_ID: undefined,
      VITE_GENERATE_SOURCEMAP: true,
      VITE_BUNDLE_ANALYZE: false,
    }
    return _env
  }
  
  const rawEnv = {
    VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
    VITE_DEV_TOOLS: import.meta.env.VITE_DEV_TOOLS,
    VITE_PERF_MONITORING: import.meta.env.VITE_PERF_MONITORING,
    VITE_AI_ENABLED: import.meta.env.VITE_AI_ENABLED,
    VITE_REALTIME_ENABLED: import.meta.env.VITE_REALTIME_ENABLED,
    VITE_BINANCE_API_KEY: import.meta.env.VITE_BINANCE_API_KEY,
    VITE_BINANCE_WS_URL: import.meta.env.VITE_BINANCE_WS_URL,
    VITE_BINANCE_REST_URL: import.meta.env.VITE_BINANCE_REST_URL,
    VITE_ALLOWED_ORIGINS: import.meta.env.VITE_ALLOWED_ORIGINS,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
    VITE_GENERATE_SOURCEMAP: import.meta.env.VITE_GENERATE_SOURCEMAP,
    VITE_BUNDLE_ANALYZE: import.meta.env.VITE_BUNDLE_ANALYZE,
  }
  
  const result = clientEnvSchema.safeParse(rawEnv)
  
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    
    console.error(
      '❌ Invalid environment variables:\n' +
      errors +
      '\n\nPlease check your .env file and .env.example for reference.'
    )
    
    // In development, throw to make the error obvious
    if (import.meta.env.DEV) {
      throw new Error('Invalid environment configuration')
    }
    
    // In production, use defaults
    _env = clientEnvSchema.parse({})
    return _env
  }
  
  _env = result.data
  return _env
}

/**
 * Helper to check if running with mock data
 */
export function useMockData(): boolean {
  return getEnv().VITE_USE_MOCK_DATA
}

/**
 * Helper to check if dev tools are enabled
 */
export function devToolsEnabled(): boolean {
  return getEnv().VITE_DEV_TOOLS || import.meta.env.DEV
}

/**
 * Helper to check if AI features are enabled
 */
export function aiEnabled(): boolean {
  return getEnv().VITE_AI_ENABLED
}

/**
 * Helper to check if realtime updates are enabled
 */
export function realtimeEnabled(): boolean {
  return getEnv().VITE_REALTIME_ENABLED
}

/**
 * Get API configuration
 */
export function getApiConfig() {
  const env = getEnv()
  return {
    binanceApiKey: env.VITE_BINANCE_API_KEY,
    binanceWsUrl: env.VITE_BINANCE_WS_URL,
    binanceRestUrl: env.VITE_BINANCE_REST_URL,
    allowedOrigins: env.VITE_ALLOWED_ORIGINS,
  }
}

/**
 * Get analytics configuration
 */
export function getAnalyticsConfig() {
  const env = getEnv()
  return {
    sentryDsn: env.VITE_SENTRY_DSN,
    analyticsId: env.VITE_ANALYTICS_ID,
  }
}

/**
 * Validate environment on module load in development
 */
if (import.meta.env.DEV) {
  try {
    getEnv()
    console.log('✅ Environment configuration validated')
  } catch (error) {
    // Error already logged in getEnv()
  }
}
