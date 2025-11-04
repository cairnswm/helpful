import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Settings, Zap, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface SchemaOptions {
  required: boolean;
  additionalProperties: boolean;
  includeExamples: boolean;
  strictTypes: boolean;
}

const JsonSchemaCreator: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<SchemaOptions>({
    required: true,
    additionalProperties: false,
    includeExamples: true,
    strictTypes: true
  });

  const inferType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') {
      // Check for common string formats
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'string'; // ISO date
      if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'string'; // Email
      if (/^https?:\/\//.test(value)) return 'string'; // URL
      return 'string';
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'number';
    }
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  };

  const getStringFormat = (value: string): string | undefined => {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'date-time';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'email';
    if (/^https?:\/\//.test(value)) return 'uri';
    return undefined;
  };

  const generateSchemaForValue = (value: any, key?: string): any => {
    const type = inferType(value);
    const schema: any = { type };

    switch (type) {
      case 'string':
        if (options.strictTypes) {
          const format = getStringFormat(value);
          if (format) {
            schema.format = format;
          }
          
          // Add string constraints
          if (value.length > 0) {
            schema.minLength = 1;
          }
          if (value.length > 100) {
            schema.maxLength = 1000; // Reasonable default
          }
        }
        
        if (options.includeExamples) {
          schema.examples = [value];
        }
        break;

      case 'integer':
      case 'number':
        if (options.strictTypes) {
          if (value >= 0) {
            schema.minimum = 0;
          }
          if (type === 'integer' && value > 0) {
            schema.minimum = 1;
          }
        }
        
        if (options.includeExamples) {
          schema.examples = [value];
        }
        break;

      case 'boolean':
        if (options.includeExamples) {
          schema.examples = [value];
        }
        break;

      case 'array':
        if (value.length > 0) {
          // Analyze array items to determine schema
          const itemTypes = new Set(value.map((item: any) => inferType(item)));
          
          if (itemTypes.size === 1) {
            // Homogeneous array
            const itemType = Array.from(itemTypes)[0];
            if (itemType === 'object') {
              // Merge all object schemas
              const mergedSchema = mergeObjectSchemas(value.map((item: any) => generateSchemaForValue(item)));
              schema.items = mergedSchema;
            } else {
              schema.items = generateSchemaForValue(value[0]);
            }
          } else {
            // Heterogeneous array - use anyOf
            const uniqueSchemas = Array.from(itemTypes).map(type => {
              const example = value.find((item: any) => inferType(item) === type);
              return generateSchemaForValue(example);
            });
            schema.items = { anyOf: uniqueSchemas };
          }
          
          if (options.strictTypes) {
            schema.minItems = 1;
          }
        } else {
          schema.items = {};
        }
        
        if (options.includeExamples && value.length > 0) {
          schema.examples = [value.slice(0, 3)]; // Show first 3 items as example
        }
        break;

      case 'object':
        schema.properties = {};
        const requiredFields: string[] = [];
        
        Object.keys(value).forEach(prop => {
          schema.properties[prop] = generateSchemaForValue(value[prop], prop);
          if (options.required && value[prop] !== null && value[prop] !== undefined) {
            requiredFields.push(prop);
          }
        });
        
        if (requiredFields.length > 0) {
          schema.required = requiredFields;
        }
        
        schema.additionalProperties = options.additionalProperties;
        
        if (options.includeExamples) {
          schema.examples = [value];
        }
        break;

      case 'null':
        // For null values, we'll use a more flexible approach
        schema.type = ['null', 'string'];
        break;
    }

    return schema;
  };

  const mergeObjectSchemas = (schemas: any[]): any => {
    if (schemas.length === 0) return {};
    if (schemas.length === 1) return schemas[0];

    const merged: any = {
      type: 'object',
      properties: {},
      additionalProperties: options.additionalProperties
    };

    const allProperties = new Set<string>();
    const requiredCounts: { [key: string]: number } = {};

    // Collect all properties and count required occurrences
    schemas.forEach(schema => {
      if (schema.properties) {
        Object.keys(schema.properties).forEach(prop => {
          allProperties.add(prop);
          if (schema.required && schema.required.includes(prop)) {
            requiredCounts[prop] = (requiredCounts[prop] || 0) + 1;
          }
        });
      }
    });

    // Merge properties
    allProperties.forEach(prop => {
      const propSchemas = schemas
        .filter(schema => schema.properties && schema.properties[prop])
        .map(schema => schema.properties[prop]);

      if (propSchemas.length === 1) {
        merged.properties[prop] = propSchemas[0];
      } else if (propSchemas.length > 1) {
        // Check if all schemas for this property are the same type
        const types = new Set(propSchemas.map(s => s.type));
        if (types.size === 1) {
          // Same type, merge constraints
          merged.properties[prop] = propSchemas[0]; // Start with first schema
          // Could add more sophisticated merging logic here
        } else {
          // Different types, use anyOf
          merged.properties[prop] = { anyOf: propSchemas };
        }
      }
    });

    // Determine required fields (present in majority of schemas)
    if (options.required) {
      const requiredFields = Object.keys(requiredCounts).filter(
        prop => requiredCounts[prop] > schemas.length / 2
      );
      if (requiredFields.length > 0) {
        merged.required = requiredFields;
      }
    }

    return merged;
  };

  const generateSchema = useCallback((jsonString: string) => {
    if (!jsonString.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const data = JSON.parse(jsonString);
      
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: inferType(data),
        title: 'Generated Schema',
        description: 'Schema generated from example JSON data',
        ...generateSchemaForValue(data)
      };

      // Remove the duplicate type field if it exists
      if (schema.type && typeof schema.type === 'string') {
        const { type, ...rest } = schema;
        const finalSchema = { ...schema, ...rest };
        setOutput(JSON.stringify(finalSchema, null, 2));
      } else {
        setOutput(JSON.stringify(schema, null, 2));
      }
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON input');
      setOutput('');
    }
  }, [options]);

  const handleInputChange = (value: string) => {
    setInput(value);
    generateSchema(value);
  };

  const handleOptionChange = (key: keyof SchemaOptions, value: boolean) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (input) {
      // Regenerate schema with new options
      setTimeout(() => generateSchema(input), 0);
    }
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

  const loadSampleData = () => {
    const sample = `{
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "isActive": true,
    "registeredAt": "2024-01-15T10:30:00Z",
    "profile": {
      "age": 30,
      "location": "New York",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    },
    "tags": ["developer", "javascript", "react"],
    "scores": [85, 92, 78, 96],
    "metadata": null
  },
  "posts": [
    {
      "id": 1,
      "title": "Getting Started with JSON Schema",
      "content": "JSON Schema is a powerful tool...",
      "publishedAt": "2024-01-10T14:20:00Z",
      "views": 1250,
      "featured": true,
      "categories": ["tutorial", "json"]
    },
    {
      "id": 2,
      "title": "Advanced Schema Validation",
      "content": "Learn advanced techniques...",
      "publishedAt": "2024-01-12T09:15:00Z",
      "views": 890,
      "featured": false,
      "categories": ["advanced", "validation"]
    }
  ],
  "settings": {
    "apiVersion": "v2",
    "maxRetries": 3,
    "timeout": 5000,
    "enableLogging": true
  }
}`;
    
    setInput(sample);
    generateSchema(sample);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON Schema Creator"
          description="Generate JSON Schema automatically from example JSON data with intelligent type inference and validation rules."
        />

        {/* Options Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Schema Generation Options</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={options.required}
                  onChange={(e) => handleOptionChange('required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
                  Mark fields as required
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="additionalProperties"
                  checked={options.additionalProperties}
                  onChange={(e) => handleOptionChange('additionalProperties', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="additionalProperties" className="ml-2 text-sm font-medium text-gray-700">
                  Allow additional properties
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeExamples"
                  checked={options.includeExamples}
                  onChange={(e) => handleOptionChange('includeExamples', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeExamples" className="ml-2 text-sm font-medium text-gray-700">
                  Include example values
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="strictTypes"
                  checked={options.strictTypes}
                  onChange={(e) => handleOptionChange('strictTypes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="strictTypes" className="ml-2 text-sm font-medium text-gray-700">
                  Add strict type constraints
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Example JSON Data</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSampleData}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear input"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your example JSON data here to generate a schema..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Generated JSON Schema</h3>
              </div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Copy schema"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                  {output || 'Generated JSON Schema will appear here...'}
                </pre>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="JSON Schema Creator Features"
          items={[
            {
              label: "Intelligent Type Inference",
              description: "Automatically detects strings, numbers, booleans, arrays, and objects"
            },
            {
              label: "Format Detection",
              description: "Recognizes common formats like dates, emails, and URLs"
            },
            {
              label: "Array Analysis",
              description: "Handles both homogeneous and heterogeneous arrays with appropriate schemas"
            },
            {
              label: "Object Merging",
              description: "Combines multiple object examples to create comprehensive schemas"
            },
            {
              label: "Validation Rules",
              description: "Adds constraints like required fields, string lengths, and number ranges"
            },
            {
              label: "Draft 2020-12",
              description: "Generates schemas compatible with the latest JSON Schema specification"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default JsonSchemaCreator;