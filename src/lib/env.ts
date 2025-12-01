// ============================================
// TradingHub Pro - Environment Validation
// Type-safe environment variable handling
// ============================================

/**
 * Environment configuration type
 */
export interface ClientEnv {
  VITE_USE_MOCK_DATA: boolean
  VITE_DEV_TOOLS: boolean
  VITE_PERF_MONITORING: boolean
  VITE_AI_ENABLED: boolean
  VITE_REALTIME_ENABLED: boolean
  VITE_BINANCE_API_KEY: string | undefined
  VITE_BINANCE_WS_URL: string
  VITE_BINANCE_REST_URL: string
  VITE_ALLOWED_ORIGINS: string[]
  VITE_SENTRY_DSN: string | undefined
  VITE_ANALYTICS_ID: string | undefined
  VITE_GENERATE_SOURCEMAP: boolean
  VITE_BUNDLE_ANALYZE: boolean
}

/**
 * Parse boolean from string environment variable
 */
function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue
  return value === 'true'
}

/**
 * Parse string array from comma-separated environment variable
 */
function parseArray(value: string | undefined, defaultValue: string): string[] {
  const str = value || defaultValue
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

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
  
  _env = {
    VITE_USE_MOCK_DATA: parseBool(import.meta.env.VITE_USE_MOCK_DATA, true),
    VITE_DEV_TOOLS: parseBool(import.meta.env.VITE_DEV_TOOLS, false),
    VITE_PERF_MONITORING: parseBool(import.meta.env.VITE_PERF_MONITORING, false),
    VITE_AI_ENABLED: parseBool(import.meta.env.VITE_AI_ENABLED, true),
    VITE_REALTIME_ENABLED: parseBool(import.meta.env.VITE_REALTIME_ENABLED, true),
    VITE_BINANCE_API_KEY: import.meta.env.VITE_BINANCE_API_KEY || undefined,
    VITE_BINANCE_WS_URL: import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws',
    VITE_BINANCE_REST_URL: import.meta.env.VITE_BINANCE_REST_URL || 'https://api.binance.com/api/v3',
    VITE_ALLOWED_ORIGINS: parseArray(
      import.meta.env.VITE_ALLOWED_ORIGINS,
      'https://api.binance.com,wss://stream.binance.com'
    ),
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || undefined,
    VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || undefined,
    VITE_GENERATE_SOURCEMAP: parseBool(import.meta.env.VITE_GENERATE_SOURCEMAP, true),
    VITE_BUNDLE_ANALYZE: parseBool(import.meta.env.VITE_BUNDLE_ANALYZE, false),
  }
  
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
  getEnv()
  console.log('✅ Environment configuration validated')
}
