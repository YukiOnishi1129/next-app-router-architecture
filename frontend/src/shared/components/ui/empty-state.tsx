type EmptyStateProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${className ?? ''}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      ) : null}
      {actions ? <div className="mt-4 flex justify-center">{actions}</div> : null}
    </div>
  )
}
