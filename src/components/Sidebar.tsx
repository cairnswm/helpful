import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Braces, FileText, Shield, 
  Binary, Link2, Search, GitCompare, 
  Hash, Clock, Palette, Database,
  Code, Globe, Plus, Terminal,
  Eye, Zap, Image, ArrowRightLeft,
  CheckCircle, Info, Type, BarChart3,
  FileX, Lock, ChevronDown, ChevronRight,
  RefreshCw
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface NavGroup {
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string>('general');

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? '' : groupTitle);
  };

  const navGroups: NavGroup[] = [
    {
      title: 'General',
      icon: Home,
      items: [
        { path: '/', label: 'Home', icon: Home },
        { path: '/image-resizer', label: 'Image Resizer', icon: Image },
        { path: '/diff-checker', label: 'Diff Checker', icon: GitCompare },
        { path: '/regex-tester', label: 'Regex Tester', icon: Search }
      ]
    },
    {
      title: 'JSON Tools',
      icon: Braces,
      items: [
        { path: '/format-json', label: 'Format JSON', icon: Braces },
        { path: '/string-to-json', label: 'String to JSON', icon: FileText },
        { path: '/json-schema-validator', label: 'JSON Schema Validator', icon: Zap },
        { path: '/json-csv-converter', label: 'JSON/CSV Converter', icon: ArrowRightLeft }
      ]
    },
    {
      title: 'File Converters',
      icon: RefreshCw,
      items: [
        { path: '/json-csv-converter', label: 'JSON ↔ CSV', icon: ArrowRightLeft },
        { path: '/yaml-json-converter', label: 'YAML ↔ JSON', icon: RefreshCw },
        { path: '/xml-json-converter', label: 'XML ↔ JSON', icon: RefreshCw },
        { path: '/markdown-html-converter', label: 'Markdown ↔ HTML', icon: RefreshCw }
      ]
    },
    {
      title: 'Security & Auth',
      icon: Shield,
      items: [
        { path: '/jwt-decoder', label: 'JWT Decoder', icon: Shield },
        { path: '/jwt-generator', label: 'JWT Generator', icon: Plus },
        { path: '/password-checker', label: 'Password Checker', icon: Lock },
        { path: '/base64', label: 'Base64 Encoder/Decoder', icon: Binary }
      ]
    },
    {
      title: 'Text & Data',
      icon: Type,
      items: [
        { path: '/text-case-converter', label: 'Text Case Converter', icon: Type },
        { path: '/url-encoder', label: 'URL Encoder/Decoder', icon: Link2 },
        { path: '/hex-converter', label: 'Hex Converter', icon: Binary },
        { path: '/markdown-previewer', label: 'Markdown Previewer', icon: Eye }
      ]
    },
    {
      title: 'Code Formatting',
      icon: Code,
      items: [
        { path: '/css-formatter', label: 'CSS Formatter', icon: Code },
        { path: '/sql-formatter', label: 'SQL Formatter', icon: Database },
        { path: '/xml-formatter', label: 'XML Formatter', icon: FileX }
      ]
    },
    {
      title: 'Database & SQL',
      icon: Database,
      items: [
        { path: '/sql-formatter', label: 'SQL Formatter', icon: Database },
        { path: '/sql-query-analyzer', label: 'SQL Query Analyzer', icon: BarChart3 }
      ]
    },
    {
      title: 'UUID Tools',
      icon: Hash,
      items: [
        { path: '/uuid-generator', label: 'UUID Generator', icon: Hash },
        { path: '/uuid-validator', label: 'UUID Validator', icon: CheckCircle }
      ]
    },
    {
      title: 'Utilities',
      icon: Clock,
      items: [
        { path: '/timestamp-converter', label: 'Timestamp Converter', icon: Clock },
        { path: '/color-picker', label: 'Color Picker', icon: Palette },
        { path: '/api-request-builder', label: 'API Request Builder', icon: Globe },
        { path: '/command-builder', label: 'Command Builder', icon: Terminal },
        { path: '/http-status-reference', label: 'HTTP Status Reference', icon: Info }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools</h2>
          <nav className="space-y-2">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroup === group.title.toLowerCase();
              
              return (
                <div key={group.title}>
                  <button
                    onClick={() => toggleGroup(group.title.toLowerCase())}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <GroupIcon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{group.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {group.items.map((item) => {
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
                    </div>
                  )}
                </div>
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