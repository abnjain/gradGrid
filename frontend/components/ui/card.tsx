import React from 'react'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`rounded-lg border bg-background shadow-sm ${className}`} {...props} />
  )
)
Card.displayName = 'Card'

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
)
CardDescription.displayName = 'CardDescription'

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)
CardContent.displayName = 'CardContent'
