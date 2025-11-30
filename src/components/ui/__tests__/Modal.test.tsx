// ============================================
// TradingHub Pro - Modal Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Modal, ConfirmModal } from '../Modal'

describe('Modal', () => {
  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Modal content
        </Modal>
      )
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          Modal content
        </Modal>
      )
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders with title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      )
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Title"
          description="Modal description"
        >
          Content
        </Modal>
      )
      expect(screen.getByText('Modal description')).toBeInTheDocument()
    })

    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          Content
        </Modal>
      )
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title" showCloseButton={false}>
          Content
        </Modal>
      )
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const

      sizes.forEach((size) => {
        const { unmount } = render(
          <Modal isOpen={true} onClose={() => {}} size={size}>
            Content
          </Modal>
        )
        expect(screen.getByText('Content')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Title">
          Content
        </Modal>
      )

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div data-testid="content">Content</div>
        </Modal>
      )

      // Click on the backdrop (first child of the fixed container)
      const backdrop = document.querySelector('.bg-black\\/70')
      if (backdrop) {
        await user.click(backdrop)
        expect(handleClose).toHaveBeenCalledTimes(1)
      }
    })

    it('does not close on overlay click when closeOnOverlayClick is false', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
          <div data-testid="content">Content</div>
        </Modal>
      )

      const backdrop = document.querySelector('.bg-black\\/70')
      if (backdrop) {
        await user.click(backdrop)
        expect(handleClose).not.toHaveBeenCalled()
      }
    })

    it('closes on Escape key press', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on Escape when closeOnEscape is false', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')
      expect(handleClose).not.toHaveBeenCalled()
    })
  })
})

describe('ConfirmModal', () => {
  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm Action"
          message="Are you sure?"
        />
      )
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('renders with default button text', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
        />
      )
      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders with custom button text', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          confirmText="Delete"
          cancelText="Keep"
        />
      )
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Keep')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <ConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          title="Title"
          message="Message"
        />
      )

      await user.click(screen.getByText('Cancel'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when confirm is clicked', async () => {
      const user = userEvent.setup()
      const handleConfirm = vi.fn()

      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={handleConfirm}
          title="Title"
          message="Message"
        />
      )

      await user.click(screen.getByText('Confirm'))
      expect(handleConfirm).toHaveBeenCalledTimes(1)
    })

    it('shows loading state', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          isLoading={true}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('disables buttons when loading', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          isLoading={true}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        // Skip the close button from Modal
        if (button.getAttribute('aria-label') !== 'Close modal') {
          expect(button).toBeDisabled()
        }
      })
    })
  })

  describe('Variants', () => {
    it('renders danger variant', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          variant="danger"
        />
      )
      expect(screen.getByText('Confirm')).toHaveClass('bg-red-600')
    })

    it('renders warning variant', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          variant="warning"
        />
      )
      expect(screen.getByText('Confirm')).toHaveClass('bg-yellow-600')
    })

    it('renders info variant', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Title"
          message="Message"
          variant="info"
        />
      )
      expect(screen.getByText('Confirm')).toHaveClass('bg-indigo-600')
    })
  })
})
