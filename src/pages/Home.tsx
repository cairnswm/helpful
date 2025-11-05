import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useToolsFilter } from '../contexts/ToolsFilterContext';
import CategoryFilterPanel from '../components/CategoryFilterPanel';

const Home: React.FC = () => {
  const { searchTerm, setSearchTerm, selectedCategory, filteredTools, tools } = useToolsFilter();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Helpful
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of professional developer utilities. Format code, decode tokens, convert files, and streamline your development workflow.
          </p>
        </header>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools... (e.g., json, yaml, convert, password)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              aria-label="Search developer tools"
            />
          </div>
          {(searchTerm || selectedCategory !== 'All') && (
            <p className="text-sm text-gray-600 mt-2 text-center" role="status" aria-live="polite">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          )}
        </div>

        {/* Category Filter Panel */}
        <CategoryFilterPanel />

        <section aria-label="Available tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  aria-label={`${tool.title}: ${tool.description}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 ${tool.color} rounded-lg`} aria-hidden="true">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium text-sm">
                    <span>Try it now</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {filteredTools.length === 0 && (
          <div className="text-center py-12" role="status">
            <div className="text-gray-400 mb-4" aria-hidden="true">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try searching with different keywords or browse all tools above.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Clear search and show all tools"
            >
              Clear Search
            </button>
          </div>
        )}

        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center" aria-labelledby="why-choose-heading">
          <h2 id="why-choose-heading" className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Helpful?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <span className="text-blue-600 font-bold text-xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast & Efficient</h4>
              <p className="text-gray-600 text-sm">Real-time processing with instant results</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <span className="text-green-600 font-bold text-xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
              <p className="text-gray-600 text-sm">All processing happens locally in your browser</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <span className="text-purple-600 font-bold text-xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Beautiful UI</h4>
              <p className="text-gray-600 text-sm">Clean, intuitive interface with syntax highlighting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <span className="text-orange-600 font-bold text-xl">🔧</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Comprehensive</h4>
              <p className="text-gray-600 text-sm">{tools.length}+ essential tools for modern development</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;