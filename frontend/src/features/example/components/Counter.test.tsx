import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter Component', () => {
  it('renders with default initial count of 0', () => {
    render(<Counter />)
    
    expect(screen.getByTestId('count-display')).toHaveTextContent('0')
    expect(screen.getByText('Counter Example')).toBeInTheDocument()
  })

  it('renders with custom initial count', () => {
    render(<Counter initialCount={10} />)
    
    expect(screen.getByTestId('count-display')).toHaveTextContent('10')
  })

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment count/i })
    const display = screen.getByTestId('count-display')
    
    expect(display).toHaveTextContent('0')
    
    await user.click(incrementButton)
    expect(display).toHaveTextContent('1')
    
    await user.click(incrementButton)
    expect(display).toHaveTextContent('2')
  })

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)
    
    const decrementButton = screen.getByRole('button', { name: /decrement count/i })
    const display = screen.getByTestId('count-display')
    
    expect(display).toHaveTextContent('5')
    
    await user.click(decrementButton)
    expect(display).toHaveTextContent('4')
    
    await user.click(decrementButton)
    expect(display).toHaveTextContent('3')
  })

  it('can go negative', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)
    
    const decrementButton = screen.getByRole('button', { name: /decrement count/i })
    const display = screen.getByTestId('count-display')
    
    await user.click(decrementButton)
    expect(display).toHaveTextContent('-1')
  })

  it('resets count to initial value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)
    
    const incrementButton = screen.getByRole('button', { name: /increment count/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })
    const display = screen.getByTestId('count-display')
    
    // Change the count
    await user.click(incrementButton)
    await user.click(incrementButton)
    expect(display).toHaveTextContent('7')
    
    // Reset
    await user.click(resetButton)
    expect(display).toHaveTextContent('5')
  })

  it('disables reset button when count equals initial count', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)
    
    const resetButton = screen.getByRole('button', { name: /reset/i })
    const incrementButton = screen.getByRole('button', { name: /increment count/i })
    
    // Initially disabled
    expect(resetButton).toBeDisabled()
    
    // Enabled after changing count
    await user.click(incrementButton)
    expect(resetButton).not.toBeDisabled()
    
    // Disabled again after reset
    await user.click(resetButton)
    expect(resetButton).toBeDisabled()
  })

  it('calls onCountChange callback with new count', async () => {
    const user = userEvent.setup()
    const handleCountChange = vi.fn()
    
    render(<Counter initialCount={0} onCountChange={handleCountChange} />)
    
    const incrementButton = screen.getByRole('button', { name: /increment count/i })
    const decrementButton = screen.getByRole('button', { name: /decrement count/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })
    
    // Increment
    await user.click(incrementButton)
    expect(handleCountChange).toHaveBeenCalledWith(1)
    
    // Decrement
    await user.click(decrementButton)
    expect(handleCountChange).toHaveBeenCalledWith(0)
    
    // Reset after changing
    await user.click(incrementButton)
    await user.click(resetButton)
    expect(handleCountChange).toHaveBeenLastCalledWith(0)
    expect(handleCountChange).toHaveBeenCalledTimes(4)
  })

  it('maintains proper styling', () => {
    render(<Counter />)
    
    const container = screen.getByText('Counter Example').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'space-y-4', 'p-6', 'bg-gray-50', 'rounded-lg')
    
    const heading = screen.getByText('Counter Example')
    expect(heading).toHaveClass('text-xl', 'font-semibold')
    
    const display = screen.getByTestId('count-display')
    expect(display).toHaveClass('text-4xl', 'font-bold')
  })

  it('handles rapid clicking', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment count/i })
    const display = screen.getByTestId('count-display')
    
    // Rapid clicks
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    
    expect(display).toHaveTextContent('5')
  })
})