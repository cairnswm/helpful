import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Braces, FileText, Shield, 
  Binary, Link2, Search, GitCompare, 
  Hash, Clock, Palette, Database,
  Code, Globe, Plus, Terminal,
  Eye, Zap, Image, ArrowRightLeft,
  CheckCircle, Info, Type, BarChart3,
  FileX, Lock
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/format-json', label: 'Format JSON', icon: Braces },
    { path: '/string-to-json', label: 'String to JSON', icon: FileText },
    { path: '/jwt-decoder', label: 'JWT Decoder', icon: Shield },
    { path: '/base64', label: 'Base64 Encoder/Decoder', icon: Binary },
    { path: '/url-encoder', label: 'URL Encoder/Decoder', icon: Link2 },
    { path: '/regex-tester', label: 'Regex Tester', icon: Search },
    { path: '/diff-checker', label: 'Diff Checker', icon: GitCompare },
    { path: '/uuid-generator', label: 'UUID Generator', icon: Hash },
    { path: '/uuid-validator', label: 'UUID Validator', icon: CheckCircle },
    { path: '/timestamp-converter', label: 'Timestamp Converter', icon: Clock },
    { path: '/css-formatter', label: 'CSS Formatter', icon: Code },
    { path: '/sql-formatter', label: 'SQL Formatter', icon: Database },
    { path: '/sql-query-analyzer', label: 'SQL Query Analyzer', icon: BarChart3 },
    { path: '/hex-converter', label: 'Hex Converter', icon: Binary },
    { path: '/color-picker', label: 'Color Picker', icon: Palette },
    { path: '/json-schema-validator', label: 'JSON Schema Validator', icon: Zap },
    { path: '/json-csv-converter', label: 'JSON/CSV Converter', icon: ArrowRightLeft },
    { path: '/api-request-builder', label: 'API Request Builder', icon: Globe },
    { path: '/jwt-generator', label: 'JWT Generator', icon: Plus },
    { path: '/command-builder', label: 'Command Builder', icon: Terminal },
    { path: '/markdown-previewer', label: 'Markdown Previewer', icon: Eye },
    { path: '/xml-formatter', label: 'XML Formatter', icon: FileX },
    { path: '/text-case-converter', label: 'Text Case Converter', icon: Type },
    { path: '/password-checker', label: 'Password Checker', icon: Lock },
    { path: '/http-status-reference', label: 'HTTP Status Reference', icon: Info },
    { path: '/image-resizer', label: 'Image Resizer', icon: Image }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="text-center">
          <p className="text-sm text-gray-500">Professional Developer Tools</p>
          <p className="text-xs text-gray-400 mt-1">Built with React & Tailwind</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;