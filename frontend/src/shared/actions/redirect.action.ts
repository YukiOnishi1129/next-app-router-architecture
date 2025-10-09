'use server'

import { redirect } from 'next/navigation'

import type { Route } from 'next'

export async function redirectAction(path: Route) {
  redirect(path)
}
