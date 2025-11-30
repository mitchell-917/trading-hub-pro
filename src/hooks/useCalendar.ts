// ============================================
// TradingHub Pro - Economic Calendar Hooks
// ============================================

import { useQuery } from '@tanstack/react-query'
import { 
  economicCalendarAPI,
  type EconomicEvent,
  type CalendarFilters,
} from '../services/api/calendar'

// ============================================
// All Calendar Events Hook
// ============================================
export function useCalendarEvents(filters?: CalendarFilters) {
  return useQuery({
    queryKey: ['calendar', 'events', filters],
    queryFn: () => economicCalendarAPI.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Today's Events Hook
// ============================================
export function useTodayEvents() {
  return useQuery({
    queryKey: ['calendar', 'today'],
    queryFn: () => economicCalendarAPI.getTodayEvents(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// High Impact Events Hook
// ============================================
export function useHighImpactEvents() {
  return useQuery({
    queryKey: ['calendar', 'high-impact'],
    queryFn: () => economicCalendarAPI.getHighImpactEvents(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Events by Country Hook
// ============================================
export function useEventsByCountry(countryCode: string) {
  return useQuery({
    queryKey: ['calendar', 'country', countryCode],
    queryFn: () => economicCalendarAPI.getEventsByCountry(countryCode),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(countryCode),
  })
}

// ============================================
// Events by Category Hook
// ============================================
export function useEventsByCategory(category: EconomicEvent['category']) {
  return useQuery({
    queryKey: ['calendar', 'category', category],
    queryFn: () => economicCalendarAPI.getEventsByCategory(category),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(category),
  })
}

// ============================================
// Event Details Hook
// ============================================
export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['calendar', 'event', eventId],
    queryFn: () => economicCalendarAPI.getEventById(eventId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(eventId),
  })
}

// ============================================
// Countries List Hook
// ============================================
export function useCalendarCountries() {
  return {
    data: economicCalendarAPI.getCountries(),
    isLoading: false,
  }
}

// ============================================
// Categories List Hook
// ============================================
export function useCalendarCategories() {
  return {
    data: economicCalendarAPI.getCategories(),
    isLoading: false,
  }
}

// ============================================
// Upcoming Events with Time Hook
// ============================================
export function useUpcomingEvents(hours: number = 24) {
  return useQuery({
    queryKey: ['calendar', 'upcoming', hours],
    queryFn: async () => {
      const events = await economicCalendarAPI.getEvents()
      const now = new Date()
      const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000)
      
      return events.filter(e => {
        const eventTime = new Date(e.date)
        const [hour, minute] = e.time.split(':').map(Number)
        eventTime.setHours(hour, minute)
        return eventTime >= now && eventTime <= cutoff
      })
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Week Calendar Hook
// ============================================
export function useWeekCalendar() {
  return useQuery({
    queryKey: ['calendar', 'week'],
    queryFn: async () => {
      const events = await economicCalendarAPI.getEvents()
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      return events.filter(e => e.date >= now && e.date <= weekEnd)
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
