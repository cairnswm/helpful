import React, { useState, useCallback, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw, Eye, Code } from 'lucide-react';

const SvgOptimizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeHiddenElements, setRemoveHiddenElements] = useState(true);
  const [minifyColors, setMinifyColors] = useState(true);
  const [replaceColors, setReplaceColors] = useState(false);
  const [colorValue, setColorValue] = useState('currentColor');
  const [setDimensions, setSetDimensions] = useState(false);
  const [widthValue, setWidthValue] = useState('24');
  const [heightValue, setHeightValue] = useState('24');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const optimizeSvg = useCallback((svg: string): string => {
    if (!svg.trim()) return '';

    try {
      let optimized = svg;

      // Remove XML declaration
      optimized = optimized.replace(/<\?xml[^?]*\?>/g, '');

      // Remove comments
      if (removeComments) {
        optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
      }

      // Remove metadata tags
      if (removeMetadata) {
        optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
        optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '');
        optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '');
      }

      // Remove hidden elements
      if (removeHiddenElements) {
        optimized = optimized.replace(/<[^>]+display\s*=\s*["']none["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '');
      }

      // Minify colors
      if (minifyColors) {
        // Convert long hex to short hex
        optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
      }

      // Replace colors with custom value
      if (replaceColors && colorValue) {
        optimized = optimized.replace(/fill=["'](?!none)([^"']*)["']/g, `fill="${colorValue}"`);
        optimized = optimized.replace(/stroke=["'](?!none)([^"']*)["']/g, `stroke="${colorValue}"`);
      }

      // Set custom dimensions
      if (setDimensions) {
        optimized = optimized.replace(/width=["']([^"']*)["']/g, `width="${widthValue}"`);
        optimized = optimized.replace(/height=["']([^"']*)["']/g, `height="${heightValue}"`);
      }

      // Remove unnecessary whitespace
      optimized = optimized.replace(/>\s+</g, '><');
      optimized = optimized.trim();

      return optimized;
    } catch {
      throw new Error('Error optimizing SVG');
    }
  }, [removeComments, removeMetadata, removeHiddenElements, minifyColors, replaceColors, colorValue, setDimensions, widthValue, heightValue]);

  const processInput = useCallback((value: string) => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const result = optimizeSvg(value);
      setOutput(result);
      setError('');
    } catch (err) {
      setError((err as Error).message || 'Error processing SVG');
      setOutput('');
    }
  }, [optimizeSvg]);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value);
  };

  useEffect(() => {
    if (input) {
      processInput(input);
    }
  }, [removeComments, removeMetadata, removeHiddenElements, minifyColors, replaceColors, colorValue, setDimensions, widthValue, heightValue, input, processInput]);

  const handleCopy = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const loadSample = () => {
    const sample = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Example SVG Icon -->
  <title>Heart Icon</title>
  <desc>A simple heart icon</desc>
  <metadata>Created with SVG Editor</metadata>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ff0000" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    
    setInput(sample);
    processInput(sample);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="SVG Optimizer & Viewer"
          description="Clean up SVG code, remove unnecessary attributes, optimize file size, preview graphics, and export as React components."
        />

        <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Options</h3>
            <button
              onClick={loadSample}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Load Sample
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeComments}
                  onChange={(e) => setRemoveComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remove Comments</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remove Metadata</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeHiddenElements}
                  onChange={(e) => setRemoveHiddenElements(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remove Hidden Elements</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minifyColors}
                  onChange={(e) => setMinifyColors(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Minify Colors</span>
              </label>
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={replaceColors}
                  onChange={(e) => setReplaceColors(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Replace Colors</span>
              </label>
              {replaceColors && (
                <div className="ml-6">
                  <label className="block text-sm text-gray-700 mb-1">Color Value</label>
                  <input
                    type="text"
                    value={colorValue}
                    onChange={(e) => setColorValue(e.target.value)}
                    placeholder="currentColor or #000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use "currentColor" or any valid color value</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={setDimensions}
                  onChange={(e) => setSetDimensions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Set Dimensions</span>
              </label>
              {setDimensions && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Width</label>
                    <input
                      type="text"
                      value={widthValue}
                      onChange={(e) => setWidthValue(e.target.value)}
                      placeholder="24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Height</label>
                    <input
                      type="text"
                      value={heightValue}
                      onChange={(e) => setHeightValue(e.target.value)}
                      placeholder="24"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                SVG Input
              </h3>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your SVG code here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Optimized SVG
              </h3>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {error ? (
                <div className="text-red-600 text-sm font-medium">{error}</div>
              ) : (
                <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                  {output || 'Optimized output will appear here...'}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {input && !error && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </h3>
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-8 min-h-[200px]">
              <div dangerouslySetInnerHTML={{ __html: output || input }} />
            </div>
          </div>
        )}

        <InfoSection 
          title="SVG Optimizer Features"
          items={[
            {
              label: "Optimization",
              description: "Removes comments, metadata, hidden elements, and minifies colors to reduce file size"
            },
            {
              label: "Color Replacement",
              description: "Replace all fill and stroke colors with a custom value like 'currentColor' for dynamic theming"
            },
            {
              label: "Dimension Control",
              description: "Set custom width and height values for all SVG elements"
            },
            {
              label: "Preview",
              description: "Live preview of the SVG graphic inline"
            }
          ]}
          useCases="web development, icon libraries, performance optimization, file size reduction, theming support"
        />
      </div>
    </div>
  );
};

export default SvgOptimizer;
