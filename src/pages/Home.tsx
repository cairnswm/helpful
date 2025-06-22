import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Braces, FileText, Shield, Binary, Link2, Search, 
  GitCompare, Hash, Clock, Palette, Database, Code, 
  Globe, Plus, Terminal, Eye, Zap, ArrowRight, Image,
  ArrowRightLeft, CheckCircle, Info, Type, BarChart3,
  FileX, Lock, RefreshCw, FileSpreadsheet, Crop, RotateCw,
  Move, Camera, Settings
} from 'lucide-react';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tools = [
    {
      icon: Braces,
      title: 'Format JSON',
      description: 'Validate and format JSON data with syntax highlighting and error detection.',
      path: '/format-json',
      color: 'bg-blue-500',
      keywords: ['json', 'format', 'validate', 'syntax', 'pretty']
    },
    {
      icon: FileText,
      title: 'String to JSON',
      description: 'Convert escaped JSON strings to properly formatted JSON objects.',
      path: '/string-to-json',
      color: 'bg-purple-500',
      keywords: ['json', 'string', 'escape', 'convert', 'parse']
    },
    {
      icon: Shield,
      title: 'JWT Decoder',
      description: 'Decode and inspect JWT tokens. View header, payload, and expiration information.',
      path: '/jwt-decoder',
      color: 'bg-green-500',
      keywords: ['jwt', 'token', 'decode', 'auth', 'security', 'bearer']
    },
    {
      icon: Binary,
      title: 'Base64 Encoder/Decoder',
      description: 'Convert strings or binary data to and from Base64 encoding.',
      path: '/base64',
      color: 'bg-indigo-500',
      keywords: ['base64', 'encode', 'decode', 'binary', 'string']
    },
    {
      icon: Link2,
      title: 'URL Encoder/Decoder',
      description: 'Encode or decode URL components for safe transmission in web requests.',
      path: '/url-encoder',
      color: 'bg-cyan-500',
      keywords: ['url', 'encode', 'decode', 'uri', 'percent', 'escape']
    },
    {
      icon: Search,
      title: 'Regex Tester',
      description: 'Build and test regular expressions interactively against sample text.',
      path: '/regex-tester',
      color: 'bg-orange-500',
      keywords: ['regex', 'regexp', 'pattern', 'match', 'test', 'expression']
    },
    {
      icon: GitCompare,
      title: 'Diff Checker',
      description: 'Compare two text snippets or JSON objects to quickly see differences.',
      path: '/diff-checker',
      color: 'bg-red-500',
      keywords: ['diff', 'compare', 'difference', 'text', 'merge']
    },
    {
      icon: Hash,
      title: 'UUID Generator',
      description: 'Generate universally unique identifiers (UUIDs) for your applications.',
      path: '/uuid-generator',
      color: 'bg-pink-500',
      keywords: ['uuid', 'guid', 'generate', 'unique', 'identifier']
    },
    {
      icon: CheckCircle,
      title: 'UUID Validator',
      description: 'Check if a given string is a valid UUID and identify its version.',
      path: '/uuid-validator',
      color: 'bg-emerald-500',
      keywords: ['uuid', 'validate', 'check', 'verify', 'version']
    },
    {
      icon: Clock,
      title: 'Timestamp Converter',
      description: 'Convert Unix timestamps to human-readable dates and vice versa.',
      path: '/timestamp-converter',
      color: 'bg-yellow-500',
      keywords: ['timestamp', 'unix', 'date', 'time', 'convert', 'epoch']
    },
    {
      icon: Code,
      title: 'CSS Formatter',
      description: 'Format or minify CSS code for better readability or smaller file sizes.',
      path: '/css-formatter',
      color: 'bg-teal-500',
      keywords: ['css', 'format', 'minify', 'style', 'beautify']
    },
    {
      icon: Database,
      title: 'SQL Formatter',
      description: 'Format messy SQL queries for better readability and maintainability.',
      path: '/sql-formatter',
      color: 'bg-emerald-500',
      keywords: ['sql', 'format', 'query', 'database', 'beautify']
    },
    {
      icon: BarChart3,
      title: 'SQL Query Analyzer',
      description: 'Analyze SQL queries for performance optimization and best practices.',
      path: '/sql-query-analyzer',
      color: 'bg-blue-600',
      keywords: ['sql', 'analyze', 'performance', 'optimize', 'query']
    },
    {
      icon: Binary,
      title: 'Hex Converter',
      description: 'Convert between text strings and hexadecimal representation.',
      path: '/hex-converter',
      color: 'bg-violet-500',
      keywords: ['hex', 'hexadecimal', 'convert', 'binary', 'ascii']
    },
    {
      icon: Palette,
      title: 'Color Picker',
      description: 'Pick colors and convert between formats with Tailwind CSS shades.',
      path: '/color-picker',
      color: 'bg-rose-500',
      keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'tailwind', 'palette']
    },
    {
      icon: Zap,
      title: 'JSON Schema Validator',
      description: 'Validate JSON data against a schema to ensure structure and constraints.',
      path: '/json-schema-validator',
      color: 'bg-amber-500',
      keywords: ['json', 'schema', 'validate', 'structure', 'constraint']
    },
    {
      icon: Settings,
      title: 'JSON Schema Creator',
      description: 'Generate JSON Schema from example JSON data automatically with type inference.',
      path: '/json-schema-creator',
      color: 'bg-indigo-600',
      keywords: ['json', 'schema', 'generate', 'create', 'infer', 'example']
    },
    {
      icon: ArrowRightLeft,
      title: 'JSON/CSV Converter',
      description: 'Transform JSON data to CSV format and vice versa for data processing.',
      path: '/json-csv-converter',
      color: 'bg-green-600',
      keywords: ['json', 'csv', 'convert', 'transform', 'data', 'export']
    },
    {
      icon: RefreshCw,
      title: 'YAML/JSON Converter',
      description: 'Convert between YAML and JSON formats with syntax validation.',
      path: '/yaml-json-converter',
      color: 'bg-purple-600',
      keywords: ['yaml', 'json', 'convert', 'config', 'data', 'format']
    },
    {
      icon: RefreshCw,
      title: 'XML/JSON Converter',
      description: 'Transform XML documents to JSON and vice versa with structure preservation.',
      path: '/xml-json-converter',
      color: 'bg-orange-600',
      keywords: ['xml', 'json', 'convert', 'transform', 'data', 'structure']
    },
    {
      icon: RefreshCw,
      title: 'Markdown/HTML Converter',
      description: 'Convert Markdown to HTML and HTML back to Markdown format.',
      path: '/markdown-html-converter',
      color: 'bg-indigo-600',
      keywords: ['markdown', 'html', 'convert', 'md', 'markup', 'format']
    },
    {
      icon: FileSpreadsheet,
      title: 'CSV to XLSX Converter',
      description: 'Convert CSV files to Excel XLSX format with auto-sized columns.',
      path: '/csv-xlsx-converter',
      color: 'bg-green-700',
      keywords: ['csv', 'xlsx', 'excel', 'convert', 'spreadsheet', 'export']
    },
    {
      icon: FileSpreadsheet,
      title: 'JSON to XLSX Converter',
      description: 'Convert JSON data to Excel XLSX format with nested object support.',
      path: '/json-xlsx-converter',
      color: 'bg-blue-700',
      keywords: ['json', 'xlsx', 'excel', 'convert', 'spreadsheet', 'export']
    },
    {
      icon: FileText,
      title: 'Markdown to PDF',
      description: 'Convert Markdown documents to professional PDF files with styling.',
      path: '/markdown-pdf-converter',
      color: 'bg-red-600',
      keywords: ['markdown', 'pdf', 'convert', 'document', 'export', 'print']
    },
    {
      icon: FileText,
      title: 'HTML to PDF',
      description: 'Convert HTML documents to PDF with CSS styling and layout support.',
      path: '/html-pdf-converter',
      color: 'bg-orange-700',
      keywords: ['html', 'pdf', 'convert', 'document', 'export', 'print']
    },
    {
      icon: Image,
      title: 'Image Resizer',
      description: 'Upload and resize images to reduce file size while maintaining quality.',
      path: '/image-resizer',
      color: 'bg-fuchsia-500',
      keywords: ['image', 'resize', 'compress', 'optimize', 'photo', 'picture']
    },
    {
      icon: Crop,
      title: 'Image Cropper',
      description: 'Select and crop portions of images with adjustable aspect ratios.',
      path: '/image-cropper',
      color: 'bg-blue-500',
      keywords: ['image', 'crop', 'cut', 'select', 'aspect', 'ratio']
    },
    {
      icon: RotateCw,
      title: 'Image Rotator & Flipper',
      description: 'Rotate images by any angle and flip them horizontally or vertically.',
      path: '/image-rotator-flipper',
      color: 'bg-purple-500',
      keywords: ['image', 'rotate', 'flip', 'transform', 'angle', 'mirror']
    },
    {
      icon: Palette,
      title: 'Image Filters & Effects',
      description: 'Apply filters like grayscale, sepia, blur, and brightness adjustments.',
      path: '/image-filters-effects',
      color: 'bg-pink-500',
      keywords: ['image', 'filter', 'effect', 'grayscale', 'sepia', 'blur']
    },
    {
      icon: Move,
      title: 'Watermark Overlay',
      description: 'Add text or image watermarks for branding and copyright protection.',
      path: '/watermark-overlay',
      color: 'bg-cyan-500',
      keywords: ['image', 'watermark', 'overlay', 'brand', 'copyright', 'protect']
    },
    {
      icon: Camera,
      title: 'Image Metadata Editor',
      description: 'View and edit EXIF data like camera info, GPS tags, and timestamps.',
      path: '/image-metadata-editor',
      color: 'bg-indigo-500',
      keywords: ['image', 'metadata', 'exif', 'camera', 'gps', 'timestamp']
    },
    {
      icon: Palette,
      title: 'Image Color Adjustments',
      description: 'Fine-tune saturation, hue, exposure, and color balance professionally.',
      path: '/image-color-adjustments',
      color: 'bg-rose-500',
      keywords: ['image', 'color', 'adjust', 'saturation', 'hue', 'exposure']
    },
    {
      icon: Globe,
      title: 'API Request Builder',
      description: 'Build and test HTTP requests with custom headers, body, and methods.',
      path: '/api-request-builder',
      color: 'bg-lime-500',
      keywords: ['api', 'http', 'request', 'rest', 'curl', 'test']
    },
    {
      icon: Plus,
      title: 'JWT Generator',
      description: 'Generate JSON Web Tokens with custom payloads and signing keys.',
      path: '/jwt-generator',
      color: 'bg-sky-500',
      keywords: ['jwt', 'generate', 'token', 'auth', 'sign', 'payload']
    },
    {
      icon: Terminal,
      title: 'Command Builder',
      description: 'Build common command line commands (curl, docker) interactively.',
      path: '/command-builder',
      color: 'bg-slate-500',
      keywords: ['command', 'cli', 'curl', 'docker', 'terminal', 'shell']
    },
    {
      icon: Eye,
      title: 'Markdown Previewer',
      description: 'Write markdown and see the live preview with syntax highlighting.',
      path: '/markdown-previewer',
      color: 'bg-neutral-500',
      keywords: ['markdown', 'preview', 'md', 'render', 'html']
    },
    {
      icon: FileX,
      title: 'XML Formatter',
      description: 'Format, validate, and convert XML documents with syntax highlighting.',
      path: '/xml-formatter',
      color: 'bg-orange-600',
      keywords: ['xml', 'format', 'validate', 'parse', 'beautify']
    },
    {
      icon: Type,
      title: 'Text Case Converter',
      description: 'Convert text between camelCase, snake_case, kebab-case, PascalCase, etc.',
      path: '/text-case-converter',
      color: 'bg-purple-600',
      keywords: ['text', 'case', 'camel', 'snake', 'kebab', 'pascal', 'convert']
    },
    {
      icon: Lock,
      title: 'Password Checker',
      description: 'Evaluate the strength and entropy of passwords with detailed analysis.',
      path: '/password-checker',
      color: 'bg-red-600',
      keywords: ['password', 'strength', 'security', 'entropy', 'check']
    },
    {
      icon: Info,
      title: 'HTTP Status Reference',
      description: 'Lookup meaning and explanation of HTTP status codes.',
      path: '/http-status-reference',
      color: 'bg-blue-700',
      keywords: ['http', 'status', 'code', 'error', 'response', 'reference']
    }
  ];

  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return tools;
    
    const searchLower = searchTerm.toLowerCase();
    return tools.filter(tool => 
      tool.title.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.keywords.some(keyword => keyword.includes(searchLower))
    );
  }, [searchTerm]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Helpful
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of professional developer utilities. Format code, decode tokens, convert files, manipulate images, and streamline your development workflow.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools... (e.g., json, yaml, convert, password, xlsx, pdf, image, schema)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 ${tool.color} rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  {tool.description}
                </p>
                
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium text-sm">
                  <span>Try it now</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try searching with different keywords or browse all tools above.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Helpful?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast & Efficient</h4>
              <p className="text-gray-600 text-sm">Real-time processing with instant results</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
              <p className="text-gray-600 text-sm">All processing happens locally in your browser</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Beautiful UI</h4>
              <p className="text-gray-600 text-sm">Clean, intuitive interface with syntax highlighting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold text-xl">🔧</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Comprehensive</h4>
              <p className="text-gray-600 text-sm">40+ essential tools for modern development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;