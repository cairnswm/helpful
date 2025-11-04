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

const ToolName = () => {
  const [state, setState] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Tool Name</h1>
      {/* Tool content */}
    </div>
  );
};

export default ToolName;
```

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
3. Add lazy import in `App.tsx`: `const ToolName = React.lazy(() => import('./pages/ToolName'));`
4. Add route in `App.tsx`: `<Route path="/tool-name" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ToolName /></React.Suspense>} />`
5. The tool will automatically appear in the sidebar and home page via the routing structure

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
