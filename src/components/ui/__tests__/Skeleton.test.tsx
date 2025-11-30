// ============================================
// TradingHub Pro - Skeleton Component Tests
// Comprehensive tests for loading skeletons
// ============================================

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton, 
  ChartSkeleton,
  PriceTickerSkeleton,
  ListSkeleton 
} from '../Skeleton'

describe('Skeleton', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />)
      
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('bg-gray-800')
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('applies custom width', () => {
      const { container } = render(<Skeleton width={200} />)
      
      expect(container.firstChild).toHaveStyle({ width: '200px' })
    })

    it('applies custom height', () => {
      const { container } = render(<Skeleton height={50} />)
      
      expect(container.firstChild).toHaveStyle({ height: '50px' })
    })

    it('accepts string dimensions', () => {
      const { container } = render(<Skeleton width="100%" height="auto" />)
      
      expect(container.firstChild).toHaveStyle({ width: '100%', height: 'auto' })
    })
  })

  describe('Variants', () => {
    it('renders text variant', () => {
      const { container } = render(<Skeleton variant="text" />)
      
      expect(container.firstChild).toHaveClass('rounded')
    })

    it('renders circular variant', () => {
      const { container } = render(<Skeleton variant="circular" />)
      
      expect(container.firstChild).toHaveClass('rounded-full')
    })

    it('renders rectangular variant', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      
      expect(container.firstChild).toHaveClass('rounded-none')
    })

    it('renders rounded variant', () => {
      const { container } = render(<Skeleton variant="rounded" />)
      
      expect(container.firstChild).toHaveClass('rounded-lg')
    })
  })

  describe('Animations', () => {
    it('applies pulse animation by default', () => {
      const { container } = render(<Skeleton />)
      
      expect(container.firstChild).toHaveClass('animate-pulse')
    })

    it('applies wave animation', () => {
      const { container } = render(<Skeleton animation="wave" />)
      
      expect(container.firstChild).toHaveClass('skeleton')
    })

    it('applies no animation', () => {
      const { container } = render(<Skeleton animation="none" />)
      
      expect(container.firstChild).not.toHaveClass('animate-pulse')
      expect(container.firstChild).not.toHaveClass('skeleton')
    })
  })
})

describe('CardSkeleton', () => {
  it('renders card skeleton structure', () => {
    const { container } = render(<CardSkeleton />)
    
    expect(container.firstChild).toHaveClass('rounded-xl')
    expect(container.firstChild).toHaveClass('border')
  })

  it('applies custom className', () => {
    const { container } = render(<CardSkeleton className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('contains multiple skeleton elements', () => {
    render(<CardSkeleton />)
    
    const skeletons = document.querySelectorAll('[class*="bg-gray-800"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('TableRowSkeleton', () => {
  it('renders default 5 columns', () => {
    const { container } = render(<TableRowSkeleton />)
    
    const skeletons = container.querySelectorAll('[class*="bg-gray-800"]')
    expect(skeletons.length).toBe(5)
  })

  it('renders custom number of columns', () => {
    const { container } = render(<TableRowSkeleton columns={3} />)
    
    const skeletons = container.querySelectorAll('[class*="bg-gray-800"]')
    expect(skeletons.length).toBe(3)
  })

  it('renders 10 columns', () => {
    const { container } = render(<TableRowSkeleton columns={10} />)
    
    const skeletons = container.querySelectorAll('[class*="bg-gray-800"]')
    expect(skeletons.length).toBe(10)
  })
})

describe('ChartSkeleton', () => {
  it('renders chart skeleton with default height', () => {
    const { container } = render(<ChartSkeleton />)
    
    expect(container.firstChild).toHaveStyle({ height: '300px' })
  })

  it('renders chart skeleton with custom height', () => {
    const { container } = render(<ChartSkeleton height={500} />)
    
    expect(container.firstChild).toHaveStyle({ height: '500px' })
  })

  it('contains bar elements', () => {
    render(<ChartSkeleton />)
    
    // Should have 20 bars based on the implementation
    const skeletons = document.querySelectorAll('[class*="flex-1"]')
    expect(skeletons.length).toBe(20)
  })

  it('has deterministic bar heights', () => {
    const { container: container1 } = render(<ChartSkeleton />)
    const { container: container2 } = render(<ChartSkeleton />)
    
    // Heights should be consistent across renders
    const bars1 = container1.querySelectorAll('[class*="flex-1"]')
    const bars2 = container2.querySelectorAll('[class*="flex-1"]')
    
    // Check that first bar has same height in both renders
    expect(bars1[0].getAttribute('style')).toBe(bars2[0].getAttribute('style'))
  })
})

describe('PriceTickerSkeleton', () => {
  it('renders ticker skeleton', () => {
    const { container } = render(<PriceTickerSkeleton />)
    
    expect(container.firstChild).toHaveClass('rounded-lg')
    expect(container.firstChild).toHaveClass('border')
  })

  it('contains circular avatar skeleton', () => {
    const { container } = render(<PriceTickerSkeleton />)
    
    const circular = container.querySelector('[class*="rounded-full"]')
    expect(circular).toBeInTheDocument()
  })
})

describe('ListSkeleton', () => {
  it('renders default 5 items', () => {
    render(<ListSkeleton />)
    
    const items = document.querySelectorAll('[class*="rounded-lg"][class*="border"]')
    expect(items.length).toBe(5)
  })

  it('renders custom number of items', () => {
    render(<ListSkeleton items={3} />)
    
    const items = document.querySelectorAll('[class*="rounded-lg"][class*="border"]')
    expect(items.length).toBe(3)
  })

  it('each item contains avatar skeleton', () => {
    render(<ListSkeleton items={2} />)
    
    const avatars = document.querySelectorAll('[class*="rounded-full"]')
    expect(avatars.length).toBe(2)
  })
})
