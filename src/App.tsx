import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import FormatJson from './pages/FormatJson';
import StringToJson from './pages/StringToJson';
import JwtDecoder from './pages/JwtDecoder';
import Base64Tool from './pages/Base64Tool';
import UrlEncoder from './pages/UrlEncoder';
import RegexTester from './pages/RegexTester';
import DiffChecker from './pages/DiffChecker';
import UuidGenerator from './pages/UuidGenerator';
import TimestampConverter from './pages/TimestampConverter';
import CssFormatter from './pages/CssFormatter';
import SqlFormatter from './pages/SqlFormatter';
import HexConverter from './pages/HexConverter';
import ColorPicker from './pages/ColorPicker';
import JsonSchemaValidator from './pages/JsonSchemaValidator';
import ApiRequestBuilder from './pages/ApiRequestBuilder';
import JwtGenerator from './pages/JwtGenerator';
import CommandBuilder from './pages/CommandBuilder';
import MarkdownPreviewer from './pages/MarkdownPreviewer';
import ImageResizer from './pages/ImageResizer';
import JsonCsvConverter from './pages/JsonCsvConverter';
import UuidValidator from './pages/UuidValidator';
import HttpStatusReference from './pages/HttpStatusReference';
import TextCaseConverter from './pages/TextCaseConverter';
import SqlQueryAnalyzer from './pages/SqlQueryAnalyzer';
import XmlFormatter from './pages/XmlFormatter';
import PasswordChecker from './pages/PasswordChecker';
import YamlJsonConverter from './pages/YamlJsonConverter';
import MarkdownHtmlConverter from './pages/MarkdownHtmlConverter';
import XmlJsonConverter from './pages/XmlJsonConverter';
import CsvXlsxConverter from './pages/CsvXlsxConverter';
import JsonXlsxConverter from './pages/JsonXlsxConverter';
import MarkdownPdfConverter from './pages/MarkdownPdfConverter';
import HtmlPdfConverter from './pages/HtmlPdfConverter';

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
              <Route path="/format-json" element={<FormatJson />} />
              <Route path="/string-to-json" element={<StringToJson />} />
              <Route path="/jwt-decoder" element={<JwtDecoder />} />
              <Route path="/base64" element={<Base64Tool />} />
              <Route path="/url-encoder" element={<UrlEncoder />} />
              <Route path="/regex-tester" element={<RegexTester />} />
              <Route path="/diff-checker" element={<DiffChecker />} />
              <Route path="/uuid-generator" element={<UuidGenerator />} />
              <Route path="/timestamp-converter" element={<TimestampConverter />} />
              <Route path="/css-formatter" element={<CssFormatter />} />
              <Route path="/sql-formatter" element={<SqlFormatter />} />
              <Route path="/hex-converter" element={<HexConverter />} />
              <Route path="/color-picker" element={<ColorPicker />} />
              <Route path="/json-schema-validator" element={<JsonSchemaValidator />} />
              <Route path="/api-request-builder" element={<ApiRequestBuilder />} />
              <Route path="/jwt-generator" element={<JwtGenerator />} />
              <Route path="/command-builder" element={<CommandBuilder />} />
              <Route path="/markdown-previewer" element={<MarkdownPreviewer />} />
              <Route path="/image-resizer" element={<ImageResizer />} />
              <Route path="/json-csv-converter" element={<JsonCsvConverter />} />
              <Route path="/uuid-validator" element={<UuidValidator />} />
              <Route path="/http-status-reference" element={<HttpStatusReference />} />
              <Route path="/text-case-converter" element={<TextCaseConverter />} />
              <Route path="/sql-query-analyzer" element={<SqlQueryAnalyzer />} />
              <Route path="/xml-formatter" element={<XmlFormatter />} />
              <Route path="/password-checker" element={<PasswordChecker />} />
              <Route path="/yaml-json-converter" element={<YamlJsonConverter />} />
              <Route path="/markdown-html-converter" element={<MarkdownHtmlConverter />} />
              <Route path="/xml-json-converter" element={<XmlJsonConverter />} />
              <Route path="/csv-xlsx-converter" element={<CsvXlsxConverter />} />
              <Route path="/json-xlsx-converter" element={<JsonXlsxConverter />} />
              <Route path="/markdown-pdf-converter" element={<MarkdownPdfConverter />} />
              <Route path="/html-pdf-converter" element={<HtmlPdfConverter />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;