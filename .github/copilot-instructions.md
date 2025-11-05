# GitHub Copilot Instructions for Helpful

## Project Overview

Helpful is a collection of developer utility tools built as a single-page application (SPA). It provides various tools for developers to format, convert, validate, and analyze data in different formats.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: npm

## Project Structure

```
helpful/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx      # Main application header
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── PageHeader.tsx  # Page header component for tool pages
│   │   ├── InfoSection.tsx # Information section component for tool pages
│   │   ├── JsonDisplay.tsx # JSON display component
│   │   └── ScrollToTop.tsx # Scroll to top component
│   ├── pages/              # Individual tool pages (each is a separate route)
│   │   ├── Home.tsx        # Landing page with tool grid
│   │   ├── FormatJson.tsx  # JSON formatter
│   │   ├── JwtDecoder.tsx  # JWT decoder
│   │   └── ...             # Many other tool pages
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
└── .github/
    └── workflows/
        └── deploy.yml      # CI/CD for deployment to FTP server
```

## Coding Conventions

### General Guidelines

1. **TypeScript**: Use TypeScript for all new files with proper type annotations
2. **Functional Components**: Use functional components with hooks (no class components)
3. **Lazy Loading**: New tool pages should be lazy-loaded in `App.tsx` using `React.lazy()`
4. **Consistent Naming**: Use PascalCase for components, camelCase for functions/variables

### Component Structure

Each tool page should follow this structure:
```typescript
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

const ToolName = () => {
  const [state, setState] = useState('');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Tool Name"
          description="Brief description of what the tool does."
        />
        
        {/* Tool content */}
        
        <InfoSection 
          title="About This Tool"
          items={[
            {
              label: "Feature 1",
              description: "Description of feature 1"
            },
            {
              label: "Feature 2",
              description: "Description of feature 2"
            }
          ]}
          useCases="Common use cases for this tool"
        />
      </div>
    </div>
  );
};

export default ToolName;
```

### Required Components

#### PageHeader
Every tool page must include a `PageHeader` component at the top:
```typescript
<PageHeader 
  title="Tool Name"
  description="Brief description of what the tool does and its purpose."
/>
```
- **title**: The name of the tool (e.g., "JSON Formatter", "Password Strength Checker")
- **description**: A one-sentence description of the tool's functionality

#### InfoSection
Every tool page must include an `InfoSection` component at the bottom:
```typescript
<InfoSection 
  title="About This Tool"
  items={[
    {
      label: "Feature Name",
      description: "Description of what this feature does"
    },
    // Add more features...
  ]}
  useCases="Common use cases: data analysis, API testing, debugging, etc."
/>
```
- **title**: Section heading (usually "About This Tool" or tool-specific title)
- **items**: Array of features with labels and descriptions
- **useCases** (optional): Comma-separated string of common use cases

### Styling

- Use Tailwind CSS utility classes for styling
- Follow mobile-first responsive design principles
- Consistent spacing: use `p-8` for page padding, `mb-6` for section spacing
- Color scheme: Use gray-50 for backgrounds, blue-600 for primary actions

### Icons

- Use Lucide React icons only
- Import specific icons: `import { IconName } from 'lucide-react'`
- Standard icon size: `className="w-5 h-5"`

### State Management

- Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- Keep state local to components when possible
- No external state management libraries (Redux, Zustand, etc.)

### Error Handling

- Always wrap potentially failing operations in try-catch blocks
- Display user-friendly error messages
- Don't expose sensitive error details to users

## Development Commands

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Adding New Tools

When adding a new tool:

1. Create a new file in `src/pages/ToolName.tsx`
2. Implement the tool following the component structure above
3. **IMPORTANT**: Always use `PageHeader` and `InfoSection` components:
   - Import: `import PageHeader from '../components/PageHeader';`
   - Import: `import InfoSection from '../components/InfoSection';`
   - `PageHeader` should be at the top of the page with a title and description
   - `InfoSection` should be at the bottom of the page with details about features and use cases
4. Add lazy import in `App.tsx`: `const ToolName = React.lazy(() => import('./pages/ToolName'));`
5. Add route in `App.tsx`: `<Route path="/tool-name" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ToolName /></React.Suspense>} />`
6. The tool will automatically appear in the sidebar and home page via the routing structure

## Code Quality

- Run `npm run lint` before committing
- Fix ESLint errors and warnings
- Use `const` instead of `let` when values don't change
- Remove unused variables and imports
- Follow React hooks rules (exhaustive deps, etc.)

## Performance Considerations

- All tool pages are lazy-loaded to reduce initial bundle size
- Use `useCallback` and `useMemo` for expensive operations
- Avoid unnecessary re-renders

## Deployment

- Pushes to `main` branch trigger automatic deployment via GitHub Actions
- Built files are deployed to an FTP server
- Build output is in `dist/` directory

## Common Patterns

### Input/Output Pattern
Most tools follow this pattern:
```typescript
const [input, setInput] = useState('');
const [output, setOutput] = useState('');

const handleProcess = () => {
  try {
    // Process input
    const result = processData(input);
    setOutput(result);
  } catch (error) {
    setOutput('Error: ' + (error as Error).message);
  }
};
```

### Copy to Clipboard
```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(output);
    // Show success feedback
  } catch (error) {
    // Show error feedback
  }
};
```

## Accessibility Requirements (WCAG 2.1 AA)

All new components and pages must meet WCAG 2.1 AA accessibility standards:

### Required Practices
1. **Semantic HTML**: Use appropriate HTML elements (header, nav, main, section, article, aside, footer)
2. **ARIA Labels**: Add `aria-label` or `aria-labelledby` to all interactive elements and regions
3. **Keyboard Navigation**: Ensure all functionality is accessible via keyboard (Tab, Enter, Space, Arrow keys)
4. **Focus Management**: Manage focus appropriately, especially on route changes and modal dialogs
5. **Screen Reader Support**: Use `sr-only` class for screen-reader-only text, add `aria-live` regions for dynamic content
6. **Form Accessibility**: Label all form inputs with `<label>` or `aria-label`, provide `aria-describedby` for help text
7. **Button Accessibility**: All buttons must have descriptive `aria-label` attributes
8. **Color Contrast**: Ensure text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
9. **Alternative Text**: Add `aria-hidden="true"` to decorative icons, descriptive `alt` for informative images
10. **Live Regions**: Use `aria-live="polite"` for status updates and `aria-live="assertive"` for errors

### Accessibility Checklist for New Features
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels are present on all custom controls
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Loading states have `role="status"` and `aria-live="polite"`
- [ ] Icons have `aria-hidden="true"` if decorative
- [ ] Buttons have descriptive `aria-label` attributes
- [ ] Color is not the only means of conveying information
- [ ] Motion respects `prefers-reduced-motion` user preference

### Example: Accessible Button
```typescript
<button
  onClick={handleAction}
  aria-label="Clear input field"
  className="p-2 hover:bg-gray-200 rounded"
>
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

### Example: Accessible Form Input
```typescript
<label htmlFor="email-input" className="block mb-2">
  Email Address
</label>
<input
  id="email-input"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  aria-describedby="email-help"
  aria-invalid={error ? 'true' : 'false'}
  className="w-full px-3 py-2 border rounded"
/>
<span id="email-help" className="text-sm text-gray-600">
  We'll never share your email with anyone else.
</span>
{error && (
  <div role="alert" className="text-red-600 text-sm mt-1">
    {error}
  </div>
)}
```

## Code Quality Standards

- Run `npm run lint` to check for issues before committing
- Address any new linting errors or warnings you introduce
- Do not modify working code unless necessary
- Focus on minimal, surgical changes to avoid introducing bugs

## Testing

Currently, the project does not have automated tests. When adding new features or modifying existing ones, perform thorough manual testing:

### Manual Testing Checklist
- **Functional Testing**: Verify the tool works as expected with valid inputs
- **Error Handling**: Test with invalid inputs to ensure proper error messages
- **Edge Cases**: Test boundary conditions (empty strings, very large inputs, special characters)
- **Browser Compatibility**: Test on Chrome, Firefox, and Safari
- **Responsive Design**: Test on desktop (1920x1080), tablet (768px), and mobile (375px) viewports
- **User Experience**: Verify loading states, button feedback, and copy-to-clipboard functionality
- **Accessibility Testing**: 
  - Test keyboard-only navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
  - Test with screen reader (NVDA on Windows, VoiceOver on Mac)
  - Verify skip links work (press Tab on page load)
  - Check color contrast with browser DevTools
  - Test with browser zoom at 200%
  - Verify focus indicators are visible
