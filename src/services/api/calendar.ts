// ============================================
// TradingHub Pro - Economic Calendar API
// ============================================

// ============================================
// Types
// ============================================
export interface EconomicEvent {
  id: string
  title: string
  country: string
  countryCode: string
  date: Date
  time: string
  impact: 'low' | 'medium' | 'high'
  category: 'interest-rate' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'consumer' | 'housing' | 'manufacturing' | 'other'
  previous?: string
  forecast?: string
  actual?: string
  currency: string
  description?: string
}

export interface CalendarFilters {
  countries?: string[]
  impact?: EconomicEvent['impact'][]
  categories?: EconomicEvent['category'][]
  startDate?: Date
  endDate?: Date
}

// ============================================
// Mock Economic Events Data
// ============================================
const generateMockEvents = (): EconomicEvent[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return [
    // Today's events
    {
      id: 'event-1',
      title: 'Fed Interest Rate Decision',
      country: 'United States',
      countryCode: 'US',
      date: today,
      time: '14:00',
      impact: 'high',
      category: 'interest-rate',
      previous: '5.50%',
      forecast: '5.50%',
      actual: '5.50%',
      currency: 'USD',
      description: 'Federal Reserve announces its decision on the federal funds rate.',
    },
    {
      id: 'event-2',
      title: 'Initial Jobless Claims',
      country: 'United States',
      countryCode: 'US',
      date: today,
      time: '08:30',
      impact: 'medium',
      category: 'employment',
      previous: '215K',
      forecast: '220K',
      actual: '218K',
      currency: 'USD',
    },
    {
      id: 'event-3',
      title: 'ECB Main Refinancing Rate',
      country: 'European Union',
      countryCode: 'EU',
      date: today,
      time: '12:45',
      impact: 'high',
      category: 'interest-rate',
      previous: '4.50%',
      forecast: '4.50%',
      currency: 'EUR',
    },
    // Tomorrow's events
    {
      id: 'event-4',
      title: 'Non-Farm Payrolls',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'high',
      category: 'employment',
      previous: '272K',
      forecast: '185K',
      currency: 'USD',
      description: 'Monthly change in employment excluding the farming industry.',
    },
    {
      id: 'event-5',
      title: 'Unemployment Rate',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'high',
      category: 'employment',
      previous: '4.0%',
      forecast: '4.0%',
      currency: 'USD',
    },
    {
      id: 'event-6',
      title: 'UK GDP (QoQ)',
      country: 'United Kingdom',
      countryCode: 'GB',
      date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      time: '07:00',
      impact: 'high',
      category: 'gdp',
      previous: '0.6%',
      forecast: '0.4%',
      currency: 'GBP',
    },
    // Day after tomorrow
    {
      id: 'event-7',
      title: 'Consumer Price Index (YoY)',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'high',
      category: 'inflation',
      previous: '3.4%',
      forecast: '3.3%',
      currency: 'USD',
      description: 'Measures the change in prices of goods and services purchased by consumers.',
    },
    {
      id: 'event-8',
      title: 'Core CPI (MoM)',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'high',
      category: 'inflation',
      previous: '0.3%',
      forecast: '0.2%',
      currency: 'USD',
    },
    {
      id: 'event-9',
      title: 'BoJ Interest Rate Decision',
      country: 'Japan',
      countryCode: 'JP',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '03:00',
      impact: 'high',
      category: 'interest-rate',
      previous: '0.10%',
      forecast: '0.10%',
      currency: 'JPY',
    },
    // This week
    {
      id: 'event-10',
      title: 'Retail Sales (MoM)',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'medium',
      category: 'consumer',
      previous: '0.1%',
      forecast: '0.3%',
      currency: 'USD',
    },
    {
      id: 'event-11',
      title: 'Industrial Production (MoM)',
      country: 'European Union',
      countryCode: 'EU',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      time: '10:00',
      impact: 'medium',
      category: 'manufacturing',
      previous: '0.8%',
      forecast: '0.2%',
      currency: 'EUR',
    },
    {
      id: 'event-12',
      title: 'Housing Starts',
      country: 'United States',
      countryCode: 'US',
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'medium',
      category: 'housing',
      previous: '1.36M',
      forecast: '1.38M',
      currency: 'USD',
    },
    {
      id: 'event-13',
      title: 'Trade Balance',
      country: 'China',
      countryCode: 'CN',
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
      time: '02:00',
      impact: 'medium',
      category: 'trade',
      previous: '82.62B',
      forecast: '70.00B',
      currency: 'CNY',
    },
    {
      id: 'event-14',
      title: 'Consumer Confidence',
      country: 'European Union',
      countryCode: 'EU',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      time: '15:00',
      impact: 'low',
      category: 'consumer',
      previous: '-14.7',
      forecast: '-14.2',
      currency: 'EUR',
    },
    {
      id: 'event-15',
      title: 'Manufacturing PMI',
      country: 'Germany',
      countryCode: 'DE',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      time: '08:30',
      impact: 'medium',
      category: 'manufacturing',
      previous: '45.4',
      forecast: '46.0',
      currency: 'EUR',
    },
  ]
}

// ============================================
// Economic Calendar API Class
// ============================================
export class EconomicCalendarAPI {
  /**
   * Get all upcoming economic events
   */
  async getEvents(filters?: CalendarFilters): Promise<EconomicEvent[]> {
    let events = generateMockEvents()

    if (filters) {
      if (filters.countries && filters.countries.length > 0) {
        events = events.filter(e => filters.countries!.includes(e.countryCode))
      }
      if (filters.impact && filters.impact.length > 0) {
        events = events.filter(e => filters.impact!.includes(e.impact))
      }
      if (filters.categories && filters.categories.length > 0) {
        events = events.filter(e => filters.categories!.includes(e.category))
      }
      if (filters.startDate) {
        events = events.filter(e => e.date >= filters.startDate!)
      }
      if (filters.endDate) {
        events = events.filter(e => e.date <= filters.endDate!)
      }
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * Get today's events
   */
  async getTodayEvents(): Promise<EconomicEvent[]> {
    const events = generateMockEvents()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return events.filter(e => e.date >= today && e.date < tomorrow)
  }

  /**
   * Get this week's high impact events
   */
  async getHighImpactEvents(): Promise<EconomicEvent[]> {
    const events = generateMockEvents()
    return events.filter(e => e.impact === 'high')
  }

  /**
   * Get events for a specific country
   */
  async getEventsByCountry(countryCode: string): Promise<EconomicEvent[]> {
    const events = generateMockEvents()
    return events.filter(e => e.countryCode === countryCode)
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(category: EconomicEvent['category']): Promise<EconomicEvent[]> {
    const events = generateMockEvents()
    return events.filter(e => e.category === category)
  }

  /**
   * Get event details
   */
  async getEventById(id: string): Promise<EconomicEvent | null> {
    const events = generateMockEvents()
    return events.find(e => e.id === id) || null
  }

  /**
   * Get list of supported countries
   */
  getCountries(): Array<{ code: string; name: string; flag: string }> {
    return [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'EU', name: 'European Union', flag: '🇪🇺' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'CN', name: 'China', flag: '🇨🇳' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    ]
  }

  /**
   * Get list of event categories
   */
  getCategories(): Array<{ value: EconomicEvent['category']; label: string }> {
    return [
      { value: 'interest-rate', label: 'Interest Rates' },
      { value: 'employment', label: 'Employment' },
      { value: 'inflation', label: 'Inflation' },
      { value: 'gdp', label: 'GDP' },
      { value: 'trade', label: 'Trade' },
      { value: 'consumer', label: 'Consumer' },
      { value: 'housing', label: 'Housing' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'other', label: 'Other' },
    ]
  }
}

// ============================================
// Export instance
// ============================================
export const economicCalendarAPI = new EconomicCalendarAPI()
