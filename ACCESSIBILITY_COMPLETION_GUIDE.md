# Accessibility Completion Guide

This guide documents the patterns needed to complete accessibility improvements for the remaining 48 tool pages.

## Progress Status

**Completed:** 10/58 pages (17%)
**Remaining:** 48 pages

## Accessibility Patterns to Apply

### 1. Icon Accessibility
**Pattern:** Add `aria-hidden="true"` to all decorative icons

**Before:**
```tsx
<Copy className="h-4 w-4" />
```

**After:**
```tsx
<Copy className="h-4 w-4" aria-hidden="true" />
```

### 2. Button Accessibility
**Pattern:** Add descriptive `aria-label` to all buttons

**Before:**
```tsx
<button onClick={handleCopy} title="Copy output">
  <Copy className="h-4 w-4" />
  <span>Copy</span>
</button>
```

**After:**
```tsx
<button 
  onClick={handleCopy}
  aria-label={copied ? 'Output copied to clipboard' : 'Copy output to clipboard'}
  title="Copy output"
>
  <Copy className="h-4 w-4" aria-hidden="true" />
  <span>Copy</span>
</button>
```

### 3. Toggle Button Groups
**Pattern:** Add `role="group"`, `aria-pressed`, and `aria-label`

**Before:**
```tsx
<div className="flex bg-gray-100 rounded-lg p-1">
  <button onClick={() => setMode('encode')}>Encode</button>
  <button onClick={() => setMode('decode')}>Decode</button>
</div>
```

**After:**
```tsx
<div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Encoding mode selection">
  <button 
    onClick={() => setMode('encode')}
    aria-pressed={mode === 'encode'}
    aria-label="Switch to encode mode"
  >
    Encode
  </button>
  <button 
    onClick={() => setMode('decode')}
    aria-pressed={mode === 'decode'}
    aria-label="Switch to decode mode"
  >
    Decode
  </button>
</div>
```

### 4. Input/Textarea Accessibility
**Pattern:** Add labels (visible or sr-only), `aria-label`, and `aria-describedby`

**Before:**
```tsx
<textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Enter text..."
/>
```

**After:**
```tsx
<label htmlFor="input-field" className="sr-only">Text input</label>
<textarea
  id="input-field"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Enter text..."
  aria-label="Text input field"
  aria-describedby="input-help"
/>
<span id="input-help" className="sr-only">Enter text to process</span>
```

### 5. Section Landmarks
**Pattern:** Replace `<div>` containers with `<section>` and add `aria-labelledby`

**Before:**
```tsx
<div className="bg-white rounded-lg">
  <div className="p-4 bg-gray-50 border-b">
    <h3 className="text-lg font-semibold">Output</h3>
  </div>
  {/* content */}
</div>
```

**After:**
```tsx
<section className="bg-white rounded-lg" aria-labelledby="output-heading">
  <div className="p-4 bg-gray-50 border-b">
    <h2 id="output-heading" className="text-lg font-semibold">Output</h2>
  </div>
  {/* content */}
</section>
```

### 6. Heading Hierarchy
**Pattern:** Use h2 for section headings (not h3), as h1 is used by PageHeader

**Before:**
```tsx
<h3 className="text-lg font-semibold">Section Title</h3>
```

**After:**
```tsx
<h2 className="text-lg font-semibold">Section Title</h2>
```

### 7. Live Regions for Dynamic Content
**Pattern:** Add `role="status"` and `aria-live` for status updates

**Before:**
```tsx
<div className="text-center text-gray-500">
  Loading...
</div>
```

**After:**
```tsx
<div className="text-center text-gray-500" role="status" aria-live="polite">
  Loading...
</div>
```

### 8. Error Messages
**Pattern:** Add `role="alert"` and `aria-live="assertive"` for errors

**Before:**
```tsx
<div className="text-red-600">{error}</div>
```

**After:**
```tsx
<div className="text-red-600" role="alert" aria-live="assertive">
  {error}
</div>
```

### 9. Lists
**Pattern:** Add `role="list"` and `role="listitem"` for semantic lists

**Before:**
```tsx
<div className="space-y-3">
  {items.map((item, index) => (
    <div key={index}>
      {item.content}
    </div>
  ))}
</div>
```

**After:**
```tsx
<div className="space-y-3" role="list" aria-label="Result items">
  {items.map((item, index) => (
    <div key={index} role="listitem">
      {item.content}
    </div>
  ))}
</div>
```

### 10. Validation States
**Pattern:** Add `aria-invalid` for form validation

**Before:**
```tsx
<input
  type="text"
  value={value}
  onChange={handleChange}
/>
```

**After:**
```tsx
<input
  type="text"
  value={value}
  onChange={handleChange}
  aria-invalid={isInvalid ? 'true' : 'false'}
  aria-describedby={isInvalid ? 'error-message' : undefined}
/>
{isInvalid && (
  <span id="error-message" role="alert">{errorText}</span>
)}
```

## Completed Pages (Reference Examples)

1. **Home.tsx** - Tool grid, search, category filters
2. **FormatJson.tsx** - Input/output panels, JSON display
3. **ApiRequestBuilder.tsx** - Complex forms, headers, request/response
4. **Base64Tool.tsx** - Encode/decode toggle, input/output
5. **UrlEncoder.tsx** - Similar to Base64Tool
6. **HtmlEntityEncoder.tsx** - Similar to Base64Tool
7. **TextCaseConverter.tsx** - Multiple conversion cards
8. **UuidGenerator.tsx** - Generator controls, UUID list
9. **UuidValidator.tsx** - Validation results
10. **HexConverter.tsx** - Hex conversion with mode toggle

## Remaining Pages (48)

Apply the same patterns to:

### Data Converters/Formatters (20 pages)
- CertificateInspector.tsx
- ColorConverter.tsx
- ColorPicker.tsx
- CssFormatter.tsx
- CsvXlsxConverter.tsx
- DiffChecker.tsx
- HashGenerator.tsx
- HtmlPdfConverter.tsx
- JavaScriptMinifier.tsx
- JsonCsvConverter.tsx
- JsonDiff.tsx
- JsonMerger.tsx
- JsonSchemaCreator.tsx
- JsonSchemaValidator.tsx
- JsonXlsxConverter.tsx
- MarkdownHtmlConverter.tsx
- MarkdownPdfConverter.tsx
- MarkdownPreviewer.tsx
- NumberBaseConverter.tsx
- SqlFormatter.tsx

### Security/Crypto Tools (7 pages)
- EncryptionTool.tsx
- JwtDecoder.tsx
- JwtGenerator.tsx
- PasswordChecker.tsx
- SecurityHeadersChecker.tsx
- SvgOptimizer.tsx
- WatermarkOverlay.tsx

### Image Tools (7 pages)
- ImageBase64Converter.tsx
- ImageColorAdjustments.tsx
- ImageCropper.tsx
- ImageFiltersEffects.tsx
- ImageMetadataEditor.tsx
- ImageResizer.tsx
- ImageRotatorFlipper.tsx

### Generators/Builders (6 pages)
- CommandBuilder.tsx
- CronExpressionBuilder.tsx
- LoremIpsumGenerator.tsx
- QRCodeGenerator.tsx
- RegexTester.tsx
- SqlQueryAnalyzer.tsx

### Utility Tools (8 pages)
- EnvVariableManager.tsx
- HttpStatusReference.tsx
- StringToJson.tsx
- TimestampConverter.tsx
- TimezoneConverter.tsx
- XmlFormatter.tsx
- XmlJsonConverter.tsx
- YamlJsonConverter.tsx

## Testing Checklist

After applying accessibility improvements:

- [ ] Run `npm run lint` - ensure no new errors
- [ ] Run `npm run build` - ensure build succeeds
- [ ] Test keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify all interactive elements have ARIA labels
- [ ] Verify all icons have aria-hidden="true"
- [ ] Verify proper heading hierarchy (h1 → h2)
- [ ] Verify live regions announce changes
- [ ] Verify error messages have role="alert"
- [ ] Verify forms have proper labels and descriptions

## Common TypeScript Issues to Fix

While applying accessibility improvements, fix these common issues:

1. **Unused variables in catch blocks:**
   ```tsx
   catch (err) { }  // Change to: catch { }
   ```

2. **Unused imports:**
   Remove any imports that aren't used after refactoring.

3. **prefer-const warnings:**
   Change `let` to `const` where variables aren't reassigned.

4. **no-explicit-any:**
   Replace `any` with specific types or `unknown`.

## Implementation Strategy

1. **Batch similar pages together** (e.g., all converters, all image tools)
2. **Start with most-used tools** based on typical usage patterns
3. **Test after each batch** to catch issues early
4. **Commit frequently** to maintain clean history

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility Documentation](https://react.dev/learn/accessibility)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS sr-only utility](https://tailwindcss.com/docs/screen-readers)
