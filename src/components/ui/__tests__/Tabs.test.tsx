// ============================================
// TradingHub Pro - Tabs Component Tests
// Comprehensive tests for tab navigation
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs'

describe('Tabs', () => {
  describe('Basic Rendering', () => {
    it('renders tabs with default value', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('hides non-active content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(container.firstChild).toHaveClass('custom-tabs')
    })
  })

  describe('Tab Switching', () => {
    it('switches content on tab click', async () => {
      const user = userEvent.setup()
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      
      await user.click(screen.getByText('Tab 2'))
      
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('calls onChange when tab changes', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Tabs defaultValue="tab1" onChange={onChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      await user.click(screen.getByText('Tab 2'))
      
      expect(onChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('TabsList', () => {
    it('renders as a tablist role', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tablist')).toHaveClass('custom-list')
    })
  })

  describe('TabsTrigger', () => {
    it('renders as a tab role', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tab')).toBeInTheDocument()
    })

    it('shows active state with aria-selected', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      const activeTab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(activeTab).toHaveAttribute('aria-selected', 'true')
    })

    it('shows inactive state with aria-selected', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      const inactiveTab = screen.getByRole('tab', { name: 'Tab 2' })
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
    })

    it('can be disabled', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' })
      expect(disabledTab).toBeDisabled()
    })

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tab')).toHaveClass('custom-trigger')
    })
  })

  describe('TabsContent', () => {
    it('renders as a tabpanel role', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">Content</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByRole('tabpanel')).toHaveClass('custom-content')
    })
  })

  describe('Focus Behavior', () => {
    it('tabs can be focused', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      tab1.focus()
      
      expect(tab1).toHaveFocus()
    })

    it('tabs have correct tabindex', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Controlled Mode', () => {
    it('works with controlled value', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      const { rerender } = render(
        <Tabs defaultValue="tab1" value="tab1" onChange={onChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      await user.click(screen.getByText('Tab 2'))
      
      expect(onChange).toHaveBeenCalledWith('tab2')
      
      // Rerender with new value
      rerender(
        <Tabs defaultValue="tab2" value="tab2" onChange={onChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Multiple Content', () => {
    it('renders multiple tabs correctly', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            <TabsTrigger value="tab4">Tab 4</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
          <TabsContent value="tab4">Content 4</TabsContent>
        </Tabs>
      )
      
      expect(screen.getAllByRole('tab')).toHaveLength(4)
    })
  })
})
