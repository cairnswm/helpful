import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useToolsFilter } from '../contexts/ToolsFilterContext';

const CategoryFilterPanel: React.FC = () => {
  const { selectedCategory, setSelectedCategory, filteredTools, categories } = useToolsFilter();
  const [showPanel, setShowPanel] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowPanel(false);
  };

  return (
    <div className="mb-8 flex justify-center">
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">
            {selectedCategory === 'All' ? 'Filter by Category' : selectedCategory}
          </span>
          {selectedCategory !== 'All' && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {filteredTools.length}
            </span>
          )}
        </button>

        {/* Category Panel */}
        {showPanel && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-10 w-[600px] max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <span className="text-sm font-semibold text-gray-900">Filter by Category</span>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilterPanel;
