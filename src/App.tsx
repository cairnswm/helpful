import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
const FormatJson = React.lazy(() => import('./pages/FormatJson'));
const StringToJson = React.lazy(() => import('./pages/StringToJson'));
const JwtDecoder = React.lazy(() => import('./pages/JwtDecoder'));
const Base64Tool = React.lazy(() => import('./pages/Base64Tool'));
const UrlEncoder = React.lazy(() => import('./pages/UrlEncoder'));
const RegexTester = React.lazy(() => import('./pages/RegexTester'));
const DiffChecker = React.lazy(() => import('./pages/DiffChecker'));
const UuidGenerator = React.lazy(() => import('./pages/UuidGenerator'));
const TimestampConverter = React.lazy(() => import('./pages/TimestampConverter'));
const CssFormatter = React.lazy(() => import('./pages/CssFormatter'));
const SqlFormatter = React.lazy(() => import('./pages/SqlFormatter'));
const HexConverter = React.lazy(() => import('./pages/HexConverter'));
const ColorPicker = React.lazy(() => import('./pages/ColorPicker'));
const JsonSchemaValidator = React.lazy(() => import('./pages/JsonSchemaValidator'));
const ApiRequestBuilder = React.lazy(() => import('./pages/ApiRequestBuilder'));
const JwtGenerator = React.lazy(() => import('./pages/JwtGenerator'));
const CommandBuilder = React.lazy(() => import('./pages/CommandBuilder'));
const MarkdownPreviewer = React.lazy(() => import('./pages/MarkdownPreviewer'));
const ImageResizer = React.lazy(() => import('./pages/ImageResizer'));
const JsonCsvConverter = React.lazy(() => import('./pages/JsonCsvConverter'));
const UuidValidator = React.lazy(() => import('./pages/UuidValidator'));
const HttpStatusReference = React.lazy(() => import('./pages/HttpStatusReference'));
const TextCaseConverter = React.lazy(() => import('./pages/TextCaseConverter'));
const SqlQueryAnalyzer = React.lazy(() => import('./pages/SqlQueryAnalyzer'));
const XmlFormatter = React.lazy(() => import('./pages/XmlFormatter'));
const PasswordChecker = React.lazy(() => import('./pages/PasswordChecker'));
const YamlJsonConverter = React.lazy(() => import('./pages/YamlJsonConverter'));
const MarkdownHtmlConverter = React.lazy(() => import('./pages/MarkdownHtmlConverter'));
const XmlJsonConverter = React.lazy(() => import('./pages/XmlJsonConverter'));
const ColorConverter = React.lazy(() => import('./pages/ColorConverter'));
const TimezoneConverter = React.lazy(() => import('./pages/TimezoneConverter'));
const HashGenerator = React.lazy(() => import('./pages/HashGenerator'));
const NumberBaseConverter = React.lazy(() => import('./pages/NumberBaseConverter'));
const LoremIpsumGenerator = React.lazy(() => import('./pages/LoremIpsumGenerator'));
const QRCodeGenerator = React.lazy(() => import('./pages/QRCodeGenerator'));
const ImageBase64Converter = React.lazy(() => import('./pages/ImageBase64Converter'));
const CronExpressionBuilder = React.lazy(() => import('./pages/CronExpressionBuilder'));
const EnvVariableManager = React.lazy(() => import('./pages/EnvVariableManager'));
const HtmlEntityEncoder = React.lazy(() => import('./pages/HtmlEntityEncoder'));
const JavaScriptMinifier = React.lazy(() => import('./pages/JavaScriptMinifier'));
const SvgOptimizer = React.lazy(() => import('./pages/SvgOptimizer'));


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/format-json" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><FormatJson /></React.Suspense>} />
              <Route path="/string-to-json" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><StringToJson /></React.Suspense>} />
              <Route path="/jwt-decoder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><JwtDecoder /></React.Suspense>} />
              <Route path="/base64" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><Base64Tool /></React.Suspense>} />
              <Route path="/url-encoder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><UrlEncoder /></React.Suspense>} />
              <Route path="/regex-tester" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><RegexTester /></React.Suspense>} />
              <Route path="/diff-checker" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><DiffChecker /></React.Suspense>} />
              <Route path="/uuid-generator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><UuidGenerator /></React.Suspense>} />
              <Route path="/timestamp-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><TimestampConverter /></React.Suspense>} />
              <Route path="/css-formatter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><CssFormatter /></React.Suspense>} />
              <Route path="/sql-formatter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><SqlFormatter /></React.Suspense>} />
              <Route path="/hex-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><HexConverter /></React.Suspense>} />
              <Route path="/color-picker" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ColorPicker /></React.Suspense>} />
              <Route path="/json-schema-validator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><JsonSchemaValidator /></React.Suspense>} />
              <Route path="/api-request-builder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ApiRequestBuilder /></React.Suspense>} />
              <Route path="/jwt-generator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><JwtGenerator /></React.Suspense>} />
              <Route path="/command-builder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><CommandBuilder /></React.Suspense>} />
              <Route path="/markdown-previewer" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><MarkdownPreviewer /></React.Suspense>} />
              <Route path="/image-resizer" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ImageResizer /></React.Suspense>} />
              <Route path="/json-csv-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><JsonCsvConverter /></React.Suspense>} />
              <Route path="/uuid-validator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><UuidValidator /></React.Suspense>} />
              <Route path="/http-status-reference" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><HttpStatusReference /></React.Suspense>} />
              <Route path="/text-case-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><TextCaseConverter /></React.Suspense>} />
              <Route path="/sql-query-analyzer" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><SqlQueryAnalyzer /></React.Suspense>} />
              <Route path="/xml-formatter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><XmlFormatter /></React.Suspense>} />
              <Route path="/password-checker" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><PasswordChecker /></React.Suspense>} />
              <Route path="/yaml-json-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><YamlJsonConverter /></React.Suspense>} />
              <Route path="/markdown-html-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><MarkdownHtmlConverter /></React.Suspense>} />
              <Route path="/xml-json-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><XmlJsonConverter /></React.Suspense>} />
              <Route path="/color-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ColorConverter /></React.Suspense>} />
              <Route path="/timezone-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><TimezoneConverter /></React.Suspense>} />
              <Route path="/hash-generator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><HashGenerator /></React.Suspense>} />
              <Route path="/number-base-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><NumberBaseConverter /></React.Suspense>} />
              <Route path="/lorem-ipsum-generator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><LoremIpsumGenerator /></React.Suspense>} />
              <Route path="/qr-code-generator" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><QRCodeGenerator /></React.Suspense>} />
              <Route path="/image-base64-converter" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><ImageBase64Converter /></React.Suspense>} />
              <Route path="/cron-expression-builder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><CronExpressionBuilder /></React.Suspense>} />
              <Route path="/env-variable-manager" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><EnvVariableManager /></React.Suspense>} />
              <Route path="/html-entity-encoder" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><HtmlEntityEncoder /></React.Suspense>} />
              <Route path="/javascript-minifier" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><JavaScriptMinifier /></React.Suspense>} />
              <Route path="/svg-optimizer" element={<React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><SvgOptimizer /></React.Suspense>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;