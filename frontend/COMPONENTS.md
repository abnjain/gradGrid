# GradGrid UI Component Library

## Complete Component Showcase

All UI components are displayed on a single, comprehensive page at `http://localhost:3000`

### Components Included

#### 1. **Buttons**
- Primary buttons with full styling and hover states
- Secondary/Ghost buttons with border styles
- Danger buttons for destructive actions
- Success buttons with green styling
- Multiple sizes: XS, Small, Medium, Large
- Disabled states for all variants
- Icon integration support

#### 2. **Input Fields**
- Default text input with placeholder
- Email input with icon and validation indicator
- Password input with show/hide toggle
- Disabled input (read-only state)
- Focus states with ring styling
- All inputs with proper accessibility attributes

#### 3. **Badges & Status Indicators**
- Status badges: Active, Pending, Inactive, Info
- Grade badges: A+, A, B, C with distinct colors
- All badges use color-coded backgrounds
- Support for light/dark theme variants

#### 4. **Alerts & Notifications**
- Info alerts (blue)
- Success alerts (green)
- Warning alerts (amber)
- Error alerts (red)
- Left border accent styling
- Inline icons for each alert type

#### 5. **Avatars**
- User profile avatars with initials
- Circular design with background colors
- Multiple color variants (blue, purple, green, orange)
- Used in forms and profile cards

#### 6. **Form Elements**
- Textarea for multi-line input
- Checkboxes with multiple states
- Disabled checkbox examples
- Select dropdown with class options
- All with proper labels and styling

#### 7. **Loading States**
- Skeleton loaders for content placeholders
- Animated skeleton animation
- Progress bar with percentage display
- Spinner/loader animation

#### 8. **Data Table**
- Student information table
- Multiple columns: Name, Roll No, Email, Status, Grade
- Table rows with hover effects
- Status badges integrated in cells
- Responsive scrolling

#### 9. **Student Profile Card**
- Full student information display
- Gradient header with profile name
- Large avatar
- Badge display for status, class, stream
- Detailed information grid
- Download and Edit action buttons
- Complete contact information

### Design System Features

**Colors Used:**
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)
- Info: Blue (#0ea5e9)
- Neutral grays and backgrounds

**Typography:**
- Sans-serif for all text (system fonts)
- Responsive sizing
- Proper font weights for hierarchy

**Spacing & Layout:**
- Flexbox-based layouts
- Consistent gap sizing
- Grid layouts for data organization
- Proper padding and margins

**Accessibility:**
- ARIA labels on interactive elements
- Focus visible styles
- Semantic HTML
- Keyboard navigation support
- High contrast ratios

### Interactive Features

- Toggle password visibility in password inputs
- Checkbox state management
- Hover effects on all interactive elements
- Responsive design for all screen sizes
- Light/dark mode support via CSS variables

### Build & Run

```bash
cd frontend
pnpm install
pnpm dev
```

Then open http://localhost:3000 to see all components in action.

### File Structure

```
frontend/
├── app/
│   ├── globals.css       (Design tokens & themes)
│   ├── layout.tsx        (Root layout)
│   ├── page.tsx          (Component showcase)
├── components/
│   └── ui/               (Reusable components)
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       ├── avatar.tsx
│       ├── checkbox.tsx
│       ├── textarea.tsx
│       ├── skeleton.tsx
│       ├── alert.tsx
│       ├── table.tsx
│       └── select.tsx
└── package.json
```

### Component Props

All components follow React best practices with:
- Proper TypeScript typing
- Forward ref support
- Compound component patterns
- CSS class merging
- Disabled state handling
- Error state management

### Next Steps

- Connect to backend API
- Add animation transitions
- Implement dark mode toggle
- Add more component variants
- Create Storybook documentation
- Add unit tests for components
