import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Braces, FileText, Shield, Binary, Link2, Search, 
  GitCompare, Hash, Clock, Palette, Database, Code, 
  Globe, Plus, Terminal, Eye, Zap, ArrowRight, Image 
} from 'lucide-react';

const Home: React.FC = () => {
  const tools = [
    {
      icon: Braces,
      title: 'Format JSON',
      description: 'Validate and format JSON data with syntax highlighting and error detection.',
      path: '/format-json',
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'String to JSON',
      description: 'Convert escaped JSON strings to properly formatted JSON objects.',
      path: '/string-to-json',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'JWT Decoder',
      description: 'Decode and inspect JWT tokens. View header, payload, and signature information.',
      path: '/jwt-decoder',
      color: 'bg-green-500'
    },
    {
      icon: Binary,
      title: 'Base64 Encoder/Decoder',
      description: 'Convert strings or binary data to and from Base64 encoding.',
      path: '/base64',
      color: 'bg-indigo-500'
    },
    {
      icon: Link2,
      title: 'URL Encoder/Decoder',
      description: 'Encode or decode URL components for safe transmission in web requests.',
      path: '/url-encoder',
      color: 'bg-cyan-500'
    },
    {
      icon: Search,
      title: 'Regex Tester',
      description: 'Build and test regular expressions interactively against sample text.',
      path: '/regex-tester',
      color: 'bg-orange-500'
    },
    {
      icon: GitCompare,
      title: 'Diff Checker',
      description: 'Compare two text snippets or JSON objects to quickly see differences.',
      path: '/diff-checker',
      color: 'bg-red-500'
    },
    {
      icon: Hash,
      title: 'UUID Generator',
      description: 'Generate universally unique identifiers (UUIDs) for your applications.',
      path: '/uuid-generator',
      color: 'bg-pink-500'
    },
    {
      icon: Clock,
      title: 'Timestamp Converter',
      description: 'Convert Unix timestamps to human-readable dates and vice versa.',
      path: '/timestamp-converter',
      color: 'bg-yellow-500'
    },
    {
      icon: Code,
      title: 'CSS Formatter',
      description: 'Format or minify CSS code for better readability or smaller file sizes.',
      path: '/css-formatter',
      color: 'bg-teal-500'
    },
    {
      icon: Database,
      title: 'SQL Formatter',
      description: 'Format messy SQL queries for better readability and maintainability.',
      path: '/sql-formatter',
      color: 'bg-emerald-500'
    },
    {
      icon: Binary,
      title: 'Hex Converter',
      description: 'Convert between text strings and hexadecimal representation.',
      path: '/hex-converter',
      color: 'bg-violet-500'
    },
    {
      icon: Palette,
      title: 'Color Picker',
      description: 'Pick colors and convert between different color formats (Hex, RGB, HSL, CMYK).',
      path: '/color-picker',
      color: 'bg-rose-500'
    },
    {
      icon: Zap,
      title: 'JSON Schema Validator',
      description: 'Validate JSON data against a schema to ensure structure and constraints.',
      path: '/json-schema-validator',
      color: 'bg-amber-500'
    },
    {
      icon: Globe,
      title: 'API Request Builder',
      description: 'Build and test HTTP requests with custom headers, body, and methods.',
      path: '/api-request-builder',
      color: 'bg-lime-500'
    },
    {
      icon: Plus,
      title: 'JWT Generator',
      description: 'Generate JSON Web Tokens with custom payloads and signing keys.',
      path: '/jwt-generator',
      color: 'bg-sky-500'
    },
    {
      icon: Terminal,
      title: 'Command Builder',
      description: 'Build common command line commands (curl, docker) interactively.',
      path: '/command-builder',
      color: 'bg-slate-500'
    },
    {
      icon: Eye,
      title: 'Markdown Previewer',
      description: 'Write markdown and see the live preview with syntax highlighting.',
      path: '/markdown-previewer',
      color: 'bg-neutral-500'
    },
    {
      icon: Image,
      title: 'Image Resizer',
      description: 'Upload and resize images to reduce file size while maintaining quality.',
      path: '/image-resizer',
      color: 'bg-fuchsia-500'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Helpful
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of professional developer utilities. Format code, decode tokens, convert data, and streamline your development workflow with our powerful tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tools.map((tool) => {
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
              <p className="text-gray-600 text-sm">19+ essential tools for modern development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;