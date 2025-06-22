import React from 'react';

interface JsonDisplayProps {
  json: string;
  isValid: boolean;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ json, isValid }) => {
  const formatJson = (jsonString: string): string => {
    if (!jsonString.trim()) return '';
    
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const highlightJson = (jsonString: string): string => {
    if (!jsonString) return '';
    
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'text-blue-600';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-purple-600 font-medium'; // property
          } else {
            cls = 'text-green-600'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-orange-600'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-red-500'; // null
        } else {
          cls = 'text-blue-600'; // number
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  const formattedJson = formatJson(json);
  const highlightedJson = highlightJson(formattedJson);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Formatted Output</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isValid 
            ? 'bg-green-100 text-green-800' 
            : json.trim() ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {!json.trim() ? 'No input' : isValid ? 'Valid JSON' : 'Invalid JSON'}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <pre 
          className="text-sm leading-relaxed font-mono whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlightedJson || 'Enter JSON data to see formatted output...' }}
        />
      </div>
    </div>
  );
};

export default JsonDisplay;