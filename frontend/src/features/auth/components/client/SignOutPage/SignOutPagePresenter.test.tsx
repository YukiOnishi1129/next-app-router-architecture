import { render, screen } from '@/test/test-utils'

import { SignOutPagePresenter } from './SignOutPagePresenter'

describe('SignOutPagePresenter', () => {
  it('renders title and description', () => {
    render(
      <SignOutPagePresenter
        title="Signing out…"
        description="We are securely signing you out."
      />
    )

    expect(screen.getByText('Signing out…')).toBeInTheDocument()
    expect(
      screen.getByText('We are securely signing you out.', { exact: true })
    ).toBeInTheDocument()
  })

  it('renders error message when present', () => {
    render(
      <SignOutPagePresenter
        title="Signing out…"
        description="We are securely signing you out."
        errorMessage="Something went wrong"
      />
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
