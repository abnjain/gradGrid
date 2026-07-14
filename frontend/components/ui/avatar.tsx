import React from 'react'

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary ${className}`}
      {...props}
    />
  )
)
Avatar.displayName = 'Avatar'

export const AvatarImage = ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} alt={alt} className="h-full w-full object-cover" {...props} />
)
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`flex h-full w-full items-center justify-center bg-secondary text-sm font-medium text-secondary-foreground ${className}`} {...props} />
)
AvatarFallback.displayName = 'AvatarFallback'
