import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Braces, FileText, Shield, Binary, Link2, Search, 
  GitCompare, Hash, Clock, Palette, Database, Code, 
  Globe, Plus, Terminal, Eye, Zap, ArrowRight, Image,
  ArrowRightLeft, CheckCircle, Info, Type, BarChart3,
  FileX, Lock, RefreshCw, Calculator, QrCode, ImageIcon,
  Settings, Minimize2, FileCheck, Key, FileSpreadsheet,
  Crop, RotateCw, Droplet, Filter, FileImage
} from 'lucide-react';
import toolsData from '../data/tools.json';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Transform tools data with icon components
  const tools = useMemo(() => {
    // Icon mapping
    const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
      Braces, FileText, Shield, Binary, Link2, Search,
      GitCompare, Hash, Clock, Palette, Database, Code,
      Globe, Plus, Terminal, Eye, Zap, ArrowRight, Image,
      ArrowRightLeft, CheckCircle, Info, Type, BarChart3,
      FileX, Lock, RefreshCw, Calculator, QrCode, ImageIcon,
      Settings, Minimize2, FileCheck, Key, FileSpreadsheet,
      Crop, RotateCw, Droplet, Filter, FileImage
    };

    return toolsData.tools.map(tool => ({
      ...tool,
      icon: iconMap[tool.icon] || Braces
    }));
  }, []);

  // Get all unique categories
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    tools.forEach(tool => {
      tool.categories.forEach(cat => allCategories.add(cat));
    });
    return ['All', ...Array.from(allCategories).sort()];
  }, [tools]);

  const filteredTools = useMemo(() => {
    let filtered = tools;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(tool => 
        tool.categories.includes(selectedCategory)
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        tool.keywords.some(keyword => keyword.includes(searchLower))
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, tools]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Helpful
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of professional developer utilities. Format code, decode tokens, convert files, and streamline your development workflow.
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
              placeholder="Search tools... (e.g., json, yaml, convert, password)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          {(searchTerm || selectedCategory !== 'All') && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-sm font-medium text-gray-700 mr-3">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
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
              <p className="text-gray-600 text-sm">57+ essential tools for modern development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;