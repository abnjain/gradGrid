import React from 'react'

export const Skeleton = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`animate-pulse rounded-md bg-secondary/30 ${className}`} {...props} />
)
Skeleton.displayName = 'Skeleton'
