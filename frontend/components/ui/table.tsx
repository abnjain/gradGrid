import React from 'react'

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className = '', ...props }, ref) => (
    <table ref={ref} className={`w-full caption-bottom text-sm ${className}`} {...props} />
  )
)
Table.displayName = 'Table'

export const TableHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`border-b ${className}`} {...props} />
)
TableHeader.displayName = 'TableHeader'

export const TableBody = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`${className}`} {...props} />
)
TableBody.displayName = 'TableBody'

export const TableRow = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`} {...props} />
)
TableRow.displayName = 'TableRow'

export const TableHead = ({ className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
)
TableHead.displayName = 'TableHead'

export const TableCell = ({ className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
)
TableCell.displayName = 'TableCell'
