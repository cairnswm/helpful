import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
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

// Icon mapping - defined outside to avoid recreation
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Braces, FileText, Shield, Binary, Link2, Search,
  GitCompare, Hash, Clock, Palette, Database, Code,
  Globe, Plus, Terminal, Eye, Zap, ArrowRight, Image,
  ArrowRightLeft, CheckCircle, Info, Type, BarChart3,
  FileX, Lock, RefreshCw, Calculator, QrCode, ImageIcon,
  Settings, Minimize2, FileCheck, Key, FileSpreadsheet,
  Crop, RotateCw, Droplet, Filter, FileImage
};

export interface Tool {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  keywords: string[];
  categories: string[];
}

interface ToolsFilterContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  tools: Tool[];
  filteredTools: Tool[];
  categories: string[];
}

const ToolsFilterContext = createContext<ToolsFilterContextType | undefined>(undefined);

export const useToolsFilter = () => {
  const context = useContext(ToolsFilterContext);
  if (!context) {
    throw new Error('useToolsFilter must be used within a ToolsFilterProvider');
  }
  return context;
};

interface ToolsFilterProviderProps {
  children: ReactNode;
}

export const ToolsFilterProvider: React.FC<ToolsFilterProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Transform tools data with icon components
  const tools = useMemo(() => 
    toolsData.tools.map(tool => ({
      ...tool,
      icon: iconMap[tool.icon] || Braces
    })),
    []
  );

  // Get all unique categories
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    tools.forEach(tool => {
      tool.categories.forEach(cat => allCategories.add(cat));
    });
    return ['All', ...Array.from(allCategories).sort()];
  }, [tools]);

  // Filter tools based on search term and category
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

  const value = {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    tools,
    filteredTools,
    categories,
  };

  return (
    <ToolsFilterContext.Provider value={value}>
      {children}
    </ToolsFilterContext.Provider>
  );
};
