import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RequestStatus } from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { RequestsStatusTabListContainer } from './RequestsStatusTabListContainer'

const mockUseRequestsStatusTabList = vi.hoisted(() => vi.fn())

vi.mock('./useRequestsStatusTabList', () => ({
  useRequestsStatusTabList: mockUseRequestsStatusTabList,
}))

describe('RequestsStatusTabListContainer', () => {
  beforeEach(() => {
    mockUseRequestsStatusTabList.mockReset()
  })

  it('renders tabs', () => {
    mockUseRequestsStatusTabList.mockReturnValue({
      tabs: [
        {
          key: 'ALL',
          label: 'All',
          href: '/requests?status=ALL',
          status: undefined,
          isActive: false,
        },
        {
          key: RequestStatus.APPROVED,
          label: 'Approved',
          href: '/requests?status=APPROVED',
          status: RequestStatus.APPROVED,
          isActive: true,
        },
      ],
    })

    render(
      <RequestsStatusTabListContainer activeKey={RequestStatus.APPROVED} />
    )

    expect(mockUseRequestsStatusTabList).toHaveBeenCalledWith({
      activeKey: RequestStatus.APPROVED,
    })

    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
