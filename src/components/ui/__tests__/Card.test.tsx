// ============================================
// TradingHub Pro - Card Component Tests
// ============================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Card, CardHeader, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Card data-testid="card">Card content</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders with elevated variant', () => {
      render(<Card variant="elevated" data-testid="card">Elevated</Card>)
      expect(screen.getByTestId('card')).toHaveClass('shadow-xl')
    })

    it('renders with interactive variant', () => {
      render(<Card variant="interactive" data-testid="card">Interactive</Card>)
      expect(screen.getByTestId('card')).toHaveClass('cursor-pointer')
    })

    it('renders without padding when noPadding is true', () => {
      render(<Card noPadding data-testid="card">No padding</Card>)
      expect(screen.getByTestId('card')).not.toHaveClass('p-4')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Custom</Card>)
      expect(screen.getByTestId('card')).toHaveClass('custom-class')
    })
  })

  describe('Animation', () => {
    it('renders without animation when animate is false', () => {
      render(<Card animate={false} data-testid="card">Static</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })
})

describe('CardHeader', () => {
  it('renders with title', () => {
    render(<CardHeader title="Header Title" />)
    expect(screen.getByText('Header Title')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle text" />)
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })

  it('renders with action', () => {
    render(
      <CardHeader
        title="Title"
        action={<button data-testid="action">Action</button>}
      />
    )
    expect(screen.getByTestId('action')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <CardHeader>
        <span data-testid="child">Child content</span>
      </CardHeader>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content area</CardContent>)
    expect(screen.getByText('Content area')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
    expect(screen.getByTestId('content')).toHaveClass('custom-content')
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('has border styling', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveClass('border-t')
  })
})

describe('Full Card Composition', () => {
  it('renders complete card structure', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader title="Card Title" subtitle="Card subtitle" />
        <CardContent>Main content area</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('full-card')).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card subtitle')).toBeInTheDocument()
    expect(screen.getByText('Main content area')).toBeInTheDocument()
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })
})
