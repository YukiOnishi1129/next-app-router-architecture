export function NeutralLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
    </div>
  )
}
