import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Braces, FileText, Shield, 
  Binary, Link2, Search, GitCompare, 
  Hash, Clock, Palette, Database,
  Code, Globe, Plus, Terminal,
  Eye, Zap, Image, ArrowRightLeft,
  CheckCircle, Info, Type, BarChart3,
  FileX, Lock, ChevronDown, ChevronRight,
  RefreshCw, FileSpreadsheet, History,
  Crop, RotateCw, Move, Camera, Menu, X,
  Settings
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

interface RecentTool {
  path: string;
  label: string;
  icon: string;
  lastUsed: number;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string>('general');
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? '' : groupTitle);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Map of icon names to components
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Home, Braces, FileText, Shield, Binary, Link2, Search, GitCompare,
    Hash, Clock, Palette, Database, Code, Globe, Plus, Terminal,
    Eye, Zap, Image, ArrowRightLeft, CheckCircle, Info, Type, BarChart3,
    FileX, Lock, RefreshCw, FileSpreadsheet, Crop, RotateCw, Move, Camera,
    Settings
  };

  const navGroups: NavGroup[] = [
    {
      title: 'General',
      icon: Home,
      items: [
        { path: '/', label: 'Home', icon: Home },
        { path: '/diff-checker', label: 'Diff Checker', icon: GitCompare },
        { path: '/regex-tester', label: 'Regex Tester', icon: Search }
      ]
    },
    {
      title: 'Image Tools',
      icon: Image,
      items: [
        { path: '/image-resizer', label: 'Image Resizer', icon: Image },
        { path: '/image-cropper', label: 'Image Cropper', icon: Crop },
        { path: '/image-rotator-flipper', label: 'Rotate & Flip', icon: RotateCw },
        { path: '/image-filters-effects', label: 'Filters & Effects', icon: Palette },
        { path: '/watermark-overlay', label: 'Watermark Overlay', icon: Move },
        { path: '/image-metadata-editor', label: 'Metadata Editor', icon: Camera },
        { path: '/image-color-adjustments', label: 'Color Adjustments', icon: Palette }
      ]
    },
    {
      title: 'JSON Tools',
      icon: Braces,
      items: [
        { path: '/format-json', label: 'Format JSON', icon: Braces },
        { path: '/string-to-json', label: 'String to JSON', icon: FileText },
        { path: '/json-schema-validator', label: 'JSON Schema Validator', icon: Zap },
        { path: '/json-schema-creator', label: 'JSON Schema Creator', icon: Settings },
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
      title: 'Excel & PDF Tools',
      icon: FileSpreadsheet,
      items: [
        { path: '/csv-xlsx-converter', label: 'CSV to XLSX', icon: FileSpreadsheet },
        { path: '/json-xlsx-converter', label: 'JSON to XLSX', icon: FileSpreadsheet },
        { path: '/markdown-pdf-converter', label: 'Markdown to PDF', icon: FileText },
        { path: '/html-pdf-converter', label: 'HTML to PDF', icon: FileText }
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

  // Get all tools from nav groups for lookup
  const allTools = navGroups.flatMap(group => 
    group.items.map(item => ({
      ...item,
      iconName: item.icon.name || 'Home'
    }))
  );

  // Load recent tools from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentTools');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentTools(parsed);
      } catch (error) {
        console.error('Failed to parse recent tools:', error);
        setRecentTools([]);
      }
    }
  }, []);

  // Track tool usage
  useEffect(() => {
    // Don't track home page
    if (location.pathname === '/') return;

    const currentTool = allTools.find(tool => tool.path === location.pathname);
    if (!currentTool) return;

    const newRecentTool: RecentTool = {
      path: currentTool.path,
      label: currentTool.label,
      icon: currentTool.iconName,
      lastUsed: Date.now()
    };

    setRecentTools(prevRecent => {
      // Remove if already exists
      const filtered = prevRecent.filter(tool => tool.path !== currentTool.path);
      
      // Add to beginning
      const updated = [newRecentTool, ...filtered];
      
      // Keep only last 3
      const limited = updated.slice(0, 3);
      
      // Save to localStorage
      localStorage.setItem('recentTools', JSON.stringify(limited));
      
      return limited;
    });
  }, [location.pathname, allTools]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools</h2>
          
          {/* Recently Used Tools */}
          {recentTools.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <History className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-gray-700">Recently Used</span>
              </div>
              <div className="space-y-1">
                {recentTools.map((tool) => {
                  const IconComponent = iconMap[tool.icon] || Home;
                  const isActive = location.pathname === tool.path;
                
                  
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tool.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4"></div>
            </div>
          )}

          {/* Regular Navigation */}
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
      
      {/* Feedback Buttons */}
      <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="space-y-2 mb-4">
          <feedback-elf-button type="review" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
          <feedback-elf-button type="bug" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
          <feedback-elf-button type="feature" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Professional Developer Tools</p>
          <p className="text-xs text-gray-400 mt-1">Built with React & Tailwind</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-lg border-r border-gray-200 h-full flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;