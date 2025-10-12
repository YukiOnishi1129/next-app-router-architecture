import { render, screen } from '@/test/test-utils'

import { SignOutRedirectPresenter } from './SignOutRedirectPresenter'

describe('SignOutRedirectPresenter', () => {
  it('renders message', () => {
    render(<SignOutRedirectPresenter message="Processing sign-out…" />)

    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(
      screen.getByText('Processing sign-out…', { exact: true })
    ).toBeInTheDocument()
  })
})
