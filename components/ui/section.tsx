import type { ReactNode } from "react"

type SectionProps = {
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export default function Section({
  title,
  description,
  actions,
  className,
  children,
}: SectionProps) {
  return (
    <section
      className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] ${
        className ?? ""
      }`}
    >
      {title ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
