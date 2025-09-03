# Flynn.ai v2 - UI Style Guide

## Design System Overview

Flynn.ai v2 uses a modern, professional design system with a focus on accessibility, consistency, and user experience. The design system is built on top of Tailwind CSS with custom design tokens and supports both light and dark themes.

## Color System

### Primary Colors

- **Background**: Pure white (light) / Deep charcoal (dark)
- **Foreground**: Near black (light) / Off white (dark)
- **Primary**: Dark charcoal for buttons and emphasis
- **Secondary**: Light gray for subtle elements

### Semantic Colors

- **Destructive**: Red for errors and warnings
- **Success**: Green for confirmations and success states
- **Warning**: Orange for cautions
- **Info**: Blue for informational content

### Usage Guidelines

- Use `background` and `foreground` for main content areas
- Use `primary` for call-to-action buttons and important UI elements
- Use `secondary` for supporting elements and less emphasized actions
- Use `muted` for subtle text and disabled states
- Use semantic colors only for their intended purposes

## Typography

### Font Stack

- **Primary Font**: Archivo Black - Bold, modern sans-serif for headings
- **Body Font**: System UI fallback for optimal performance
- **Monospace**: Standard monospace stack for code and technical content

### Type Scale

```css
/* Headings */
h1: text-5xl font-bold (Archivo Black)
h2: text-3xl font-bold (Archivo Black)
h3: text-2xl font-semibold
h4: text-xl font-semibold
h5: text-lg font-medium
h6: text-base font-medium

/* Body Text */
body: text-base font-normal
small: text-sm
caption: text-xs

/* Interactive Elements */
button: text-sm font-medium
input: text-sm font-normal
label: text-sm font-medium
```

### Typography Guidelines

- Use Archivo Black for all headings and brand elements
- Use system fonts for body text for performance
- Maintain consistent line heights (1.5 for body, 1.2 for headings)
- Use font weights sparingly: normal, medium, semibold, bold

## Spacing System

### Base Unit

- Base spacing unit: `0.25rem` (4px)
- All spacing should use multiples of the base unit

### Common Spacing Values

```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
3xl: 3rem (48px)
```

### Layout Guidelines

- Use consistent spacing between elements
- Maintain visual hierarchy with proper spacing
- Use padding for internal spacing, margin for external spacing

## Component Library

### Buttons

#### Primary Button

```jsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
  Primary Action
</button>
```

#### Secondary Button

```jsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg font-medium transition-colors">
  Secondary Action
</button>
```

#### Destructive Button

```jsx
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg font-medium transition-colors">
  Delete
</button>
```

### Form Elements

#### Input Field

```jsx
<input className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring" />
```

#### Select Dropdown

```jsx
<select className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
  <option>Choose option</option>
</select>
```

#### Label

```jsx
<label className="block text-sm font-medium text-foreground mb-2">
  Field Label
</label>
```

### Cards

#### Basic Card

```jsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
  <h3 className="text-xl font-semibold text-card-foreground mb-2">
    Card Title
  </h3>
  <p className="text-muted-foreground">Card content goes here.</p>
</div>
```

#### Interactive Card

```jsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  <h3 className="text-xl font-semibold text-card-foreground mb-2">
    Interactive Card
  </h3>
  <p className="text-muted-foreground">Hover for effect.</p>
</div>
```

### Navigation

#### Header Navigation

```jsx
<header className="bg-background border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-foreground">Flynn.ai v2</h1>
      </div>
    </div>
  </div>
</header>
```

## Layout Patterns

### Page Layout

```jsx
<div className="min-h-screen bg-background">
  <header className="bg-card border-b border-border">{/* Navigation */}</header>
  <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    {/* Page content */}
  </main>
</div>
```

### Form Layout

```jsx
<form className="space-y-6 max-w-md mx-auto">
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      Field Label
    </label>
    <input className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
  <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
    Submit
  </button>
</form>
```

### Grid Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## States and Interactions

### Hover States

- Use `hover:` modifiers for interactive elements
- Subtle opacity changes: `hover:opacity-90`
- Background color changes: `hover:bg-primary/90`

### Focus States

- Always include focus styles for accessibility
- Use ring utilities: `focus:ring-2 focus:ring-ring`
- Remove default outline: `focus:outline-none`

### Disabled States

- Use `disabled:` modifiers
- Apply opacity: `disabled:opacity-50`
- Remove pointer events: `disabled:cursor-not-allowed`

### Loading States

- Use subtle animations: `animate-spin`, `animate-pulse`
- Maintain layout during loading
- Provide clear loading indicators

## Accessibility Guidelines

### Color Contrast

- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text
- Test with accessibility tools

### Focus Management

- All interactive elements must be keyboard accessible
- Provide clear focus indicators
- Logical tab order

### Semantic HTML

- Use proper semantic elements (`button`, `nav`, `main`, `article`)
- Include proper ARIA labels where needed
- Use headings in proper hierarchy

## Dark Mode Support

### Implementation

The design system includes full dark mode support with automatic theme switching based on user preference.

### Testing

- Test all components in both light and dark modes
- Ensure proper contrast in both themes
- Verify images and icons work in both themes

## Best Practices

### Performance

- Use system fonts when possible
- Minimize custom CSS
- Leverage Tailwind's purge functionality

### Maintainability

- Use design tokens consistently
- Document any custom components
- Follow naming conventions

### User Experience

- Maintain consistent interactions
- Provide immediate feedback
- Design for mobile-first

## Implementation Notes

1. All colors use the CSS custom property system for theme switching
2. The Archivo Black font is loaded for headings and brand elements
3. Tailwind configuration extends the theme with custom design tokens
4. Components should use semantic color names, not specific color values
5. All spacing should use the defined spacing scale
