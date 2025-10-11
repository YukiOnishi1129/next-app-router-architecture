import type { RequestStatus } from './status'
import type { Route } from 'next'

export type RequestsStatusTabKey = 'ALL' | RequestStatus

export type RequestsStatusRoute = Route<
  '/requests' | `/requests?status=${RequestsStatusTabKey}`
>
