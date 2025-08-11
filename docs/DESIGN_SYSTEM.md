# ETH Boss Hunter Design System

## 🎨 Brand Identity

ETH Boss Hunter uses a **cyberpunk/synthwave aesthetic** with neon colors and dark backgrounds, inspired by 80s arcade games and crypto culture.

## 🌈 Color Palette

### Primary Colors
- **Cyan**: `#06b6d4` - Primary brand color, used for highlights and active states
- **Purple**: `#8b5cf6` - Secondary brand color, used for gradients and accents
- **Pink**: `#ec4899` - Tertiary brand color, used for HP bars and special effects

### Background Colors
- **Primary**: `#0f0729` - Main background (deep purple)
- **Secondary**: `#1a1a2e` - Card backgrounds and overlays
- **Card**: `rgba(0, 0, 0, 0.6)` - Semi-transparent card backgrounds

### Text Colors
- **Primary**: `#ffffff` - Main text
- **Secondary**: `#ededed` - Subdued text
- **Muted**: `#9ca3af` - Disabled/placeholder text
- **Cyan**: `#06b6d4` - Accent text
- **Purple**: `#a855f7` - Purple accent text
- **Pink**: `#ec4899` - Pink accent text

### Status Colors
- **Success**: `#10b981` - Completed bosses, victory states
- **Warning**: `#f97316` - HP bars, caution states
- **Danger**: `#ef4444` - Error states, low HP

## 🎭 Gradients

### Primary Gradients
- **Primary**: `linear-gradient(45deg, #06b6d4, #8b5cf6)` - Main brand gradient
- **Secondary**: `linear-gradient(45deg, #8b5cf6, #ec4899)` - Alternative gradient
- **Background**: `linear-gradient(to bottom right, #581c87, #1e3a8a, #3730a3)` - Page background
- **Text**: `linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899)` - Gradient text effects

### Game-Specific Gradients
- **HP Bar**: `linear-gradient(to right, #ef4444, #f97316, #eab308)` - Health bar
- **Progress**: `linear-gradient(to right, #06b6d4, #3b82f6)` - Battle progress
- **Success**: `linear-gradient(to right, #10b981, #34d399)` - Victory states

## 🔤 Typography

### Font Families
- **Primary**: `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Mono**: `'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace`

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)
- **5xl**: `3rem` (48px)
- **6xl**: `3.75rem` (60px)
- **8xl**: `6rem` (96px)

### Font Weights
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **black**: 900

## 📏 Spacing

### Spacing Scale
- **1**: `0.25rem` (4px)
- **2**: `0.5rem` (8px)
- **3**: `0.75rem` (12px)
- **4**: `1rem` (16px)
- **6**: `1.5rem` (24px)
- **8**: `2rem` (32px)
- **12**: `3rem` (48px)
- **16**: `4rem` (64px)
- **20**: `5rem` (80px)
- **24**: `6rem` (96px)

## 🔲 Border Radius

- **sm**: `0.375rem` (6px)
- **md**: `0.5rem` (8px)
- **lg**: `0.75rem` (12px)
- **xl**: `1rem` (16px)
- **2xl**: `1.5rem` (24px)
- **full**: `9999px` (fully rounded)

## 🌟 Shadows

- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`
- **2xl**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`

### Colored Shadows
- **Cyan**: `0 0 20px rgba(6, 182, 212, 0.5)`
- **Purple**: `0 0 20px rgba(139, 92, 246, 0.5)`
- **Pink**: `0 0 20px rgba(236, 72, 153, 0.5)`

## ⚡ Animations

### Transitions
- **fast**: `150ms ease-in-out`
- **normal**: `300ms ease-in-out`
- **slow**: `500ms ease-in-out`

## 🧩 Component Styles

### Boss Cards
```css
.boss-card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-2xl);
}

.boss-card-current {
  border-color: var(--color-primary-cyan);
  box-shadow: 0 0 30px var(--color-shadow-cyan);
}

.boss-card-defeated {
  border-color: var(--color-success);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}
```

### Buttons
```css
.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-lg);
}
```

### Progress Bars
```css
.progress-bar {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  box-shadow: var(--shadow-md);
}
```

## 📱 Responsive Design

### Mobile Breakpoints
- **Default**: Desktop styles
- **768px and below**: Mobile-optimized typography and spacing

### Mobile Adjustments
- Reduced font sizes for better readability
- Adjusted spacing for touch interfaces
- Optimized card layouts for smaller screens

## 🎯 Usage Guidelines

### When to Use Each Color
- **Cyan**: Primary actions, current boss, active states
- **Purple**: Secondary elements, gradients, mystical effects
- **Pink**: HP bars, special effects, accent highlights
- **Success Green**: Completed bosses, victory states
- **Warning Orange**: HP bars, caution indicators
- **Danger Red**: Error states, critical health

### Accessibility
- All color combinations meet WCAG AA contrast requirements
- Text colors have sufficient contrast against backgrounds
- Interactive elements have clear hover/focus states

### Brand Consistency
- Always use the defined color palette
- Maintain consistent spacing and typography
- Use gradients for premium/hero elements
- Apply shadows for depth and hierarchy
