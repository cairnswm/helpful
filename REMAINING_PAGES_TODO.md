# Remaining Pages for Accessibility Improvements

## Progress: 13/58 pages completed (22%)

## Completed Pages
1. Home.tsx
2. FormatJson.tsx
3. ApiRequestBuilder.tsx
4. Base64Tool.tsx
5. UrlEncoder.tsx
6. HtmlEntityEncoder.tsx
7. TextCaseConverter.tsx
8. UuidGenerator.tsx
9. UuidValidator.tsx
10. HexConverter.tsx
11. NumberBaseConverter.tsx
12. HashGenerator.tsx
13. TimestampConverter.tsx

## High Priority Remaining (Most Used Tools) - 15 pages
- [ ] JwtDecoder.tsx
- [ ] JwtGenerator.tsx
- [ ] PasswordChecker.tsx
- [ ] RegexTester.tsx
- [ ] QRCodeGenerator.tsx
- [ ] JsonCsvConverter.tsx
- [ ] LoremIpsumGenerator.tsx
- [ ] StringToJson.tsx
- [ ] SqlFormatter.tsx
- [ ] CssFormatter.tsx
- [ ] JavaScriptMinifier.tsx
- [ ] ColorPicker.tsx
- [ ] ColorConverter.tsx
- [ ] MarkdownPreviewer.tsx
- [ ] DiffChecker.tsx

## Medium Priority - 16 pages
- [ ] JsonSchemaValidator.tsx
- [ ] JsonSchemaCreator.tsx
- [ ] CertificateInspector.tsx
- [ ] EncryptionTool.tsx
- [ ] CommandBuilder.tsx
- [ ] CronExpressionBuilder.tsx
- [ ] HttpStatusReference.tsx
- [ ] SecurityHeadersChecker.tsx
- [ ] EnvVariableManager.tsx
- [ ] SqlQueryAnalyzer.tsx
- [ ] TimezoneConverter.tsx
- [ ] MarkdownHtmlConverter.tsx
- [ ] MarkdownPdfConverter.tsx
- [ ] HtmlPdfConverter.tsx
- [ ] CsvXlsxConverter.tsx
- [ ] JsonXlsxConverter.tsx

## Lower Priority (Specialized Tools) - 14 pages
- [ ] XmlFormatter.tsx
- [ ] XmlJsonConverter.tsx
- [ ] YamlJsonConverter.tsx
- [ ] JsonDiff.tsx
- [ ] JsonMerger.tsx
- [ ] SvgOptimizer.tsx
- [ ] ImageBase64Converter.tsx
- [ ] ImageColorAdjustments.tsx
- [ ] ImageCropper.tsx
- [ ] ImageFiltersEffects.tsx
- [ ] ImageMetadataEditor.tsx
- [ ] ImageResizer.tsx
- [ ] ImageRotatorFlipper.tsx
- [ ] WatermarkOverlay.tsx

## Quick Reference Pattern Checklist

For each page, apply these patterns:

### 1. Icons
- [ ] Add `aria-hidden="true"` to all decorative icons

### 2. Buttons
- [ ] Add `aria-label` (especially for icon-only buttons)
- [ ] Add `aria-pressed` for toggle buttons
- [ ] Include dynamic state in aria-label (e.g., "copied" vs "copy")

### 3. Inputs/Textareas
- [ ] Add `<label>` (visible or `sr-only`)
- [ ] Add `id` to input and connect with `htmlFor` on label
- [ ] Add `aria-label` for additional context
- [ ] Add `aria-describedby` for help text
- [ ] Add `aria-invalid` for error states

### 4. Sections
- [ ] Replace `<div>` with `<section>` for major areas
- [ ] Add `aria-labelledby` pointing to heading
- [ ] Change `<h3>` to `<h2>` for section headings
- [ ] Add unique `id` to headings

### 5. Lists
- [ ] Add `role="list"` and `aria-label`
- [ ] Add `role="listitem"` to items

### 6. Dynamic Content
- [ ] Add `role="status"` with `aria-live="polite"` for updates
- [ ] Add `role="alert"` with `aria-live="assertive"` for errors

### 7. Toggle Groups
- [ ] Add `role="group"` with `aria-label`
- [ ] Add `aria-pressed` to each toggle button

## Estimated Time
- High priority: ~5 hours (15 pages × 20 min)
- Medium priority: ~5.5 hours (16 pages × 20 min)
- Lower priority: ~4.5 hours (14 pages × 20 min)
- **Total: ~15 hours**
