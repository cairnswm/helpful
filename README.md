# Helpful - Developer Utilities

A comprehensive collection of developer utility tools built with React, TypeScript, and Tailwind CSS. This single-page application provides various tools to help developers with common tasks like formatting, converting, validating, and analyzing data.

## 🚀 Features

### Data Format Tools
- **JSON Formatter** - Format and beautify JSON data
- **JSON to CSV Converter** - Convert between JSON and CSV formats
- **JSON Schema Validator** - Validate JSON against schemas
- **XML Formatter** - Format and beautify XML data
- **XML to JSON Converter** - Convert between XML and JSON
- **YAML to JSON Converter** - Convert between YAML and JSON
- **String to JSON** - Parse strings into JSON objects

### Code Formatters
- **CSS Formatter** - Format and beautify CSS code
- **SQL Formatter** - Format SQL queries
- **SQL Query Analyzer** - Analyze and explain SQL queries

### Encoding & Decoding
- **Base64 Encoder/Decoder** - Encode and decode Base64 strings
- **URL Encoder/Decoder** - Encode and decode URLs
- **JWT Decoder** - Decode and inspect JWT tokens
- **JWT Generator** - Generate JWT tokens
- **Hex Converter** - Convert between hex and text

### Generators & Validators
- **UUID Generator** - Generate UUIDs (v4)
- **UUID Validator** - Validate UUID formats
- **Hash Generator** - Generate various hash types (MD5, SHA-1, SHA-256, etc.)
- **Password Strength Checker** - Analyze password strength

### Developer Tools
- **Regex Tester** - Test regular expressions
- **Diff Checker** - Compare text differences
- **Timestamp Converter** - Convert between timestamps and dates
- **Timezone Converter** - Convert times between timezones
- **Color Picker** - Pick and convert colors
- **Color Converter** - Convert between color formats
- **Number Base Converter** - Convert between number bases
- **Text Case Converter** - Convert text case (upper, lower, camel, etc.)

### API & Markdown Tools
- **API Request Builder** - Build and test API requests
- **HTTP Status Reference** - Reference for HTTP status codes
- **Markdown Previewer** - Preview markdown in real-time
- **Markdown to HTML Converter** - Convert Markdown to HTML
- **Command Builder** - Build command-line commands

### Image Tools
- **Image Resizer** - Resize images

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/cairnswm/helpful.git

# Navigate to project directory
cd helpful

# Install dependencies
npm ci

# Start development server
npm run dev
```

## 🚀 Usage

### Development

```bash
# Start dev server (usually runs on http://localhost:5173)
npm run dev

# Alternative start command
npm start
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
helpful/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.tsx        # Main app header
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── PageHeader.tsx    # Page header for tool pages
│   │   ├── InfoSection.tsx   # Information section for tool pages
│   │   └── ...              # Other shared components
│   ├── pages/          # Tool pages (each tool is a separate page)
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── .github/
│   └── workflows/      # GitHub Actions for deployment
└── dist/               # Build output (generated)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding a New Tool

1. Create a new component in `src/pages/YourTool.tsx`
2. **Import and use required components:**
   ```typescript
   import PageHeader from '../components/PageHeader';
   import InfoSection from '../components/InfoSection';
   ```
3. **Structure your page with PageHeader at the top:**
   ```typescript
   <PageHeader 
     title="Your Tool Name"
     description="Brief description of what the tool does."
   />
   ```
4. **Add InfoSection at the bottom with features and use cases:**
   ```typescript
   <InfoSection 
     title="About This Tool"
     items={[
       { label: "Feature", description: "Description" }
     ]}
     useCases="Common use cases"
   />
   ```
5. Add lazy import in `src/App.tsx`
6. Add route in `src/App.tsx`
7. **Add the tool to `src/data/tools.json`** (see Tools Configuration section below)
8. Follow existing patterns and styling conventions

See `.github/copilot-instructions.md` for detailed development guidelines.

### Tools Configuration

All tools are centrally configured in `src/data/tools.json`. This file controls which tools appear on the home page and enables category-based filtering.

#### Structure

```json
{
  "tools": [
    {
      "id": "tool-url-slug",
      "title": "Tool Display Name",
      "description": "Brief description of what the tool does.",
      "path": "/tool-url-path",
      "icon": "IconName",
      "color": "bg-color-class",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "categories": ["Category1", "Category2"]
    }
  ]
}
```

#### Field Descriptions

- **id**: Unique identifier for the tool (typically matches the URL slug)
- **title**: Display name shown on cards and in navigation
- **description**: One-sentence description of the tool's functionality
- **path**: URL route path (must match the route in App.tsx)
- **icon**: Name of the Lucide React icon (e.g., "Braces", "Shield", "Image")
  - Available icons must be imported in `src/pages/Home.tsx`
- **color**: Tailwind CSS background color class for the tool's card icon (e.g., "bg-blue-500")
- **keywords**: Array of searchable keywords for better discovery
- **categories**: Array of category names this tool belongs to
  - Tools can belong to multiple categories
  - Categories are automatically aggregated and displayed as filter buttons on the home page
  - Common categories: "JSON Tools", "Converters", "Security & Auth", "Image Tools", "Formatters", "Generators", "Validators", "Development Tools", etc.

#### Maintaining Categories

When adding a new tool:
1. Choose appropriate existing categories or create new ones if needed
2. Keep category names consistent across tools
3. A tool can belong to multiple categories (e.g., a JSON converter might be in both "JSON Tools" and "Converters")
4. Categories will automatically appear in the filter UI on the home page

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
