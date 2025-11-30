// ============================================
// TradingHub Pro - Currency & Locale Service
// Dynamic currency based on user's geolocation
// ============================================

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
  decimals: number
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimals: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimals: 2 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK', decimals: 2 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', decimals: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', decimals: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', decimals: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU', decimals: 2 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR', decimals: 2 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', decimals: 2 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', decimals: 2 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimals: 2 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', decimals: 2 },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimals: 0 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', decimals: 2 },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', decimals: 2 },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL', decimals: 2 },
}

// Country code to currency mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  UK: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  CY: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  JP: 'JPY',
  AU: 'AUD',
  CA: 'CAD',
  CH: 'CHF',
  CN: 'CNY',
  IN: 'INR',
  KR: 'KRW',
  SG: 'SGD',
  HK: 'HKD',
  NZ: 'NZD',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  MX: 'MXN',
  BR: 'BRL',
  ZA: 'ZAR',
  RU: 'RUB',
  TR: 'TRY',
  PL: 'PLN',
  TH: 'THB',
  ID: 'IDR',
  MY: 'MYR',
  PH: 'PHP',
  VN: 'VND',
  AE: 'AED',
  SA: 'SAR',
  IL: 'ILS',
}

const STORAGE_KEY = 'trading-hub-currency'
const COUNTRY_STORAGE_KEY = 'trading-hub-country'

/**
 * Get currency from localStorage or default
 */
export function getStoredCurrency(): string {
  if (typeof window === 'undefined') return 'USD'
  return localStorage.getItem(STORAGE_KEY) || 'USD'
}

/**
 * Store currency preference
 */
export function setStoredCurrency(currency: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, currency)
  }
}

/**
 * Get stored country code
 */
export function getStoredCountry(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(COUNTRY_STORAGE_KEY)
}

/**
 * Store country code
 */
export function setStoredCountry(country: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTRY_STORAGE_KEY, country)
  }
}

/**
 * Get currency config by code
 */
export function getCurrencyConfig(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.USD
}

/**
 * Detect user's country using free IP geolocation API
 */
export async function detectUserCountry(): Promise<string> {
  // Check stored country first
  const storedCountry = getStoredCountry()
  if (storedCountry) {
    return storedCountry
  }

  try {
    // Try ipapi.co (free, no API key needed)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    })
    
    if (response.ok) {
      const data = await response.json()
      const country = data.country_code || 'US'
      setStoredCountry(country)
      return country
    }
  } catch (error) {
    console.warn('Failed to detect country from ipapi.co:', error)
  }

  try {
    // Fallback: ip-api.com
    const response = await fetch('http://ip-api.com/json/?fields=countryCode', {
      signal: AbortSignal.timeout(5000),
    })
    
    if (response.ok) {
      const data = await response.json()
      const country = data.countryCode || 'US'
      setStoredCountry(country)
      return country
    }
  } catch (error) {
    console.warn('Failed to detect country from ip-api.com:', error)
  }

  // Default to US
  return 'US'
}

/**
 * Get currency based on country code
 */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD'
}

/**
 * Detect and set currency based on user's location
 */
export async function detectAndSetCurrency(): Promise<CurrencyConfig> {
  const country = await detectUserCountry()
  const currencyCode = getCurrencyForCountry(country)
  setStoredCurrency(currencyCode)
  return getCurrencyConfig(currencyCode)
}

/**
 * Format price with dynamic currency
 */
export function formatPriceWithCurrency(
  price: number,
  currencyCode: string = 'USD'
): string {
  const config = getCurrencyConfig(currencyCode)
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(price)
}

/**
 * Format large numbers compactly with currency
 */
export function formatCompactCurrency(
  value: number,
  currencyCode: string = 'USD'
): string {
  const config = getCurrencyConfig(currencyCode)
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value)
}
