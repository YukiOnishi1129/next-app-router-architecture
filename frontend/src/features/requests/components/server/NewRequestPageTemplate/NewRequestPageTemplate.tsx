import { RequestForm } from '@/features/requests/components/client/RequestForm'

export async function NewRequestPageTemplate() {
  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Create request</h1>
        <p className="text-muted-foreground text-sm">
          Draft a new request for approval. Provide as much detail as possible
          to accelerate the review process.
        </p>
      </header>

      <RequestForm />
    </section>
  )
}
