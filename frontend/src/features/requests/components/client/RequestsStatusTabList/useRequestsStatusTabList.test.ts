import { describe, expect, it } from 'vitest'

import { RequestStatus } from '@/features/requests/types'

import { useRequestsStatusTabList } from './useRequestsStatusTabList'

describe('useRequestsStatusTabList', () => {
  it('marks the active tab and returns definitions', () => {
    const { tabs } = useRequestsStatusTabList({
      activeKey: RequestStatus.SUBMITTED,
    })

    const submittedTab = tabs.find((tab) => tab.key === RequestStatus.SUBMITTED)
    const allTab = tabs.find((tab) => tab.key === 'ALL')

    expect(submittedTab?.isActive).toBe(true)
    expect(submittedTab?.status).toBe(RequestStatus.SUBMITTED)
    expect(allTab?.isActive).toBe(false)
    expect(tabs).toHaveLength(5)
  })
})
