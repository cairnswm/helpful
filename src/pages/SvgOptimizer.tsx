import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw, Eye, Code } from 'lucide-react';

const SvgOptimizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [reactMode, setReactMode] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeHiddenElements, setRemoveHiddenElements] = useState(true);
  const [minifyColors, setMinifyColors] = useState(true);
  const [usePlaceholders, setUsePlaceholders] = useState(false);
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

      // Remove unnecessary whitespace
      optimized = optimized.replace(/>\s+</g, '><');
      optimized = optimized.trim();

      return optimized;
    } catch (err) {
      throw new Error('Error optimizing SVG');
    }
  }, [removeComments, removeMetadata, removeHiddenElements, minifyColors]);

  const convertToReactComponent = useCallback((svg: string): string => {
    if (!svg.trim()) return '';

    try {
      let reactSvg = svg;

      // Extract SVG attributes
      const svgMatch = reactSvg.match(/<svg[^>]*>/);
      let svgTag = svgMatch ? svgMatch[0] : '<svg>';
      
      // Get viewBox for default dimensions
      const viewBoxMatch = svgTag.match(/viewBox=["']([^"']+)["']/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
      const viewBoxParts = viewBox.split(' ');
      const defaultWidth = viewBoxParts[2] || '24';
      const defaultHeight = viewBoxParts[3] || '24';

      // Replace attributes for React
      reactSvg = reactSvg.replace(/class=/g, 'className=');
      reactSvg = reactSvg.replace(/stroke-width=/g, 'strokeWidth=');
      reactSvg = reactSvg.replace(/stroke-linecap=/g, 'strokeLinecap=');
      reactSvg = reactSvg.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
      reactSvg = reactSvg.replace(/fill-rule=/g, 'fillRule=');
      reactSvg = reactSvg.replace(/clip-rule=/g, 'clipRule=');
      reactSvg = reactSvg.replace(/fill-opacity=/g, 'fillOpacity=');
      reactSvg = reactSvg.replace(/stroke-opacity=/g, 'strokeOpacity=');

      if (usePlaceholders) {
        // Replace colors with currentColor or props
        reactSvg = reactSvg.replace(/fill=["'](?!none)([^"']*)["']/g, 'fill={color || "currentColor"}');
        reactSvg = reactSvg.replace(/stroke=["'](?!none)([^"']*)["']/g, 'stroke={color || "currentColor"}');
        
        // Replace fixed dimensions
        reactSvg = reactSvg.replace(/width=["']([^"']*)["']/g, 'width={width}');
        reactSvg = reactSvg.replace(/height=["']([^"']*)["']/g, 'height={height}');
      }

      // Extract SVG content (remove outer svg tag)
      const svgContent = reactSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

      // Build React component
      const componentName = 'SvgIcon';
      const propsInterface = usePlaceholders
        ? `interface ${componentName}Props {
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
}`
        : `interface ${componentName}Props {
  className?: string;
}`;

      const defaultProps = usePlaceholders
        ? `width = ${defaultWidth}, height = ${defaultHeight}, color = "currentColor", className = ""`
        : `className = ""`;

      return `${propsInterface}

const ${componentName}: React.FC<${componentName}Props> = ({ ${defaultProps} }) => {
  return (
    <svg
      width={${usePlaceholders ? 'width' : `"${defaultWidth}"`}}
      height={${usePlaceholders ? 'height' : `"${defaultHeight}"`}}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      ${svgContent}
    </svg>
  );
};

export default ${componentName};`;
    } catch (err) {
      throw new Error('Error converting to React component');
    }
  }, [usePlaceholders]);

  const processInput = useCallback((value: string) => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      let result = optimizeSvg(value);
      
      if (reactMode) {
        result = convertToReactComponent(result);
      }

      setOutput(result);
      setError('');
    } catch (err) {
      setError((err as Error).message || 'Error processing SVG');
      setOutput('');
    }
  }, [optimizeSvg, convertToReactComponent, reactMode]);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value);
  };

  const handleOptionChange = () => {
    processInput(input);
  };

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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeComments}
                onChange={(e) => {
                  setRemoveComments(e.target.checked);
                  handleOptionChange();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remove Comments</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeMetadata}
                onChange={(e) => {
                  setRemoveMetadata(e.target.checked);
                  handleOptionChange();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remove Metadata</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeHiddenElements}
                onChange={(e) => {
                  setRemoveHiddenElements(e.target.checked);
                  handleOptionChange();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remove Hidden Elements</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={minifyColors}
                onChange={(e) => {
                  setMinifyColors(e.target.checked);
                  handleOptionChange();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Minify Colors</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reactMode}
                onChange={(e) => {
                  setReactMode(e.target.checked);
                  handleOptionChange();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">React Component</span>
            </label>

            {reactMode && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePlaceholders}
                  onChange={(e) => {
                    setUsePlaceholders(e.target.checked);
                    handleOptionChange();
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Use Props for Size/Color</span>
              </label>
            )}
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
                {reactMode ? 'React Component' : 'Optimized SVG'}
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
        {!reactMode && input && !error && (
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
              label: "React Component",
              description: "Convert SVG to a React component with TypeScript interface"
            },
            {
              label: "Props Support",
              description: "Add props for width, height, and color when React mode is enabled"
            },
            {
              label: "Preview",
              description: "Live preview of the SVG graphic inline"
            }
          ]}
          useCases="web development, React applications, icon libraries, performance optimization, file size reduction"
        />
      </div>
    </div>
  );
};

export default SvgOptimizer;
