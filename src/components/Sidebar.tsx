import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Braces, FileText, Shield, 
  Binary, Link2, Search, GitCompare, 
  Hash, Clock, Palette, Database,
  Code, Globe, Plus, Terminal,
  Eye, Zap, Image, ArrowRightLeft,
  CheckCircle, Info, Type, BarChart3,
  FileX, Lock, ChevronDown, ChevronRight,
  RefreshCw, Calculator, QrCode, ImageIcon,
  Settings, Minimize2, FileCheck, Key,
  FileSpreadsheet, Crop, RotateCw, Droplet, Filter, FileImage, Sparkles
} from 'lucide-react';
import toolsData from '../data/tools.json';

// Icon mapping
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Braces, FileText, Shield, Binary, Link2, Search,
  GitCompare, Hash, Clock, Palette, Database, Code,
  Globe, Plus, Terminal, Eye, Zap, ArrowRightLeft, Image,
  CheckCircle, Info, Type, BarChart3,
  FileX, Lock, RefreshCw, Calculator, QrCode, ImageIcon,
  Settings, Minimize2, FileCheck, Key, FileSpreadsheet,
  Crop, RotateCw, Droplet, Filter, FileImage, Sparkles
};

// Category to icon mapping - defines which icon to use for each category
const categoryIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'JSON Tools': Braces,
  'Security & Auth': Shield,
  'Text & Data': Type,
  'Image Tools': Image,
  'Converters': RefreshCw,
  'UUID Tools': Hash,
  'Time Tools': Clock,
  'Color Tools': Palette,
  'Code Formatting': Code,
  'Database & SQL': Database,
  'Development Tools': Terminal,
  'API Tools': Globe,
  'Generators': Plus,
  'Encoders': Binary,
  'Decoders': Binary,
  'Validators': CheckCircle,
  'Formatters': Code,
  'Reference': Info,
  'AI Tools': Sparkles
};

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavGroup {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? '' : groupTitle);
  };

  // Build navigation groups dynamically from tools.json
  const navGroups = useMemo<NavGroup[]>(() => {
    // Create a map of categories to tools
    const categoryMap = new Map<string, NavItem[]>();
    
    toolsData.tools.forEach(tool => {
      const toolIcon = iconMap[tool.icon] || Braces;
      const navItem: NavItem = {
        path: tool.path,
        label: tool.title,
        icon: toolIcon
      };
      
      // Add tool to each of its categories
      tool.categories.forEach(category => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        const items = categoryMap.get(category);
        if (items) {
          items.push(navItem);
        }
      });
    });
    
    // Convert map to array of NavGroups, sorted alphabetically
    const groups: NavGroup[] = Array.from(categoryMap.entries())
      .map(([category, items]) => ({
        title: category,
        icon: categoryIconMap[category] || Code,
        items: items.sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
    
    return groups;
  }, []);

  // Filter navigation based on search term
  const filteredNavGroups = useMemo(() => {
    if (!searchTerm.trim()) return navGroups;
    
    const searchLower = searchTerm.toLowerCase();
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(searchLower) ||
        item.path.toLowerCase().includes(searchLower)
      )
    })).filter(group => group.items.length > 0);
  }, [searchTerm, navGroups]);

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col" role="complementary" aria-label="Tools navigation">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tools</h2>
          
          {/* Home Link - Standalone */}
          <Link
            to="/"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 mb-4 ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <Home className={`h-4 w-4 ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
            <span className="font-medium">Home</span>
          </Link>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search tools"
            />
          </div>

          <nav className="space-y-2" aria-label="Main">
            {filteredNavGroups.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroup === group.title.toLowerCase();
              
              return (
                <div key={group.title}>
                  <button
                    onClick={() => toggleGroup(group.title.toLowerCase())}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    aria-expanded={isExpanded}
                    aria-controls={`${group.title.toLowerCase()}-group`}
                  >
                    <div className="flex items-center space-x-3">
                      <GroupIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      <span className="font-medium text-sm">{group.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div 
                      className="ml-4 mt-1 space-y-1"
                      id={`${group.title.toLowerCase()}-group`}
                      role="group"
                      aria-label={`${group.title} tools`}
                    >
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
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
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
      
      <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0" role="contentinfo">
        <div className="text-center">
          <p className="text-sm text-gray-500">Professional Developer Tools</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;