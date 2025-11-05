import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { parseAndCleanJson } from '../utils/jsonCleaner';

interface ValidationError {
  path: string;
  message: string;
}

const JsonSchemaValidator: React.FC = () => {
  const [jsonData, setJsonData] = useState('');
  const [schema, setSchema] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [copied, setCopied] = useState(false);
  const [jsonWasCleaned, setJsonWasCleaned] = useState(false);
  const [schemaWasCleaned, setSchemaWasCleaned] = useState(false);

  // Basic JSON Schema validation (simplified implementation)
  const validateJsonSchema = useCallback((data: any, schemaObj: any, path = ''): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!schemaObj || typeof schemaObj !== 'object') {
      return errors;
    }

    // Type validation
    if (schemaObj.type) {
      const expectedType = schemaObj.type;
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      
      if (actualType !== expectedType) {
        errors.push({
          path: path || 'root',
          message: `Expected type '${expectedType}' but got '${actualType}'`
        });
        return errors;
      }
    }

    // Required properties validation
    if (schemaObj.required && Array.isArray(schemaObj.required) && typeof data === 'object' && data !== null) {
      schemaObj.required.forEach((prop: string) => {
        if (!(prop in data)) {
          errors.push({
            path: path ? `${path}.${prop}` : prop,
            message: `Missing required property '${prop}'`
          });
        }
      });
    }

    // Properties validation
    if (schemaObj.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      Object.keys(schemaObj.properties).forEach(prop => {
        if (prop in data) {
          const propPath = path ? `${path}.${prop}` : prop;
          const propErrors = validateJsonSchema(data[prop], schemaObj.properties[prop], propPath);
          errors.push(...propErrors);
        }
      });
    }

    // Array items validation
    if (schemaObj.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        const itemErrors = validateJsonSchema(item, schemaObj.items, itemPath);
        errors.push(...itemErrors);
      });
    }

    // String validations
    if (typeof data === 'string') {
      if (schemaObj.minLength && data.length < schemaObj.minLength) {
        errors.push({
          path: path || 'root',
          message: `String length ${data.length} is less than minimum ${schemaObj.minLength}`
        });
      }
      if (schemaObj.maxLength && data.length > schemaObj.maxLength) {
        errors.push({
          path: path || 'root',
          message: `String length ${data.length} exceeds maximum ${schemaObj.maxLength}`
        });
      }
      if (schemaObj.pattern) {
        const regex = new RegExp(schemaObj.pattern);
        if (!regex.test(data)) {
          errors.push({
            path: path || 'root',
            message: `String does not match pattern '${schemaObj.pattern}'`
          });
        }
      }
    }

    // Number validations
    if (typeof data === 'number') {
      if (schemaObj.minimum !== undefined && data < schemaObj.minimum) {
        errors.push({
          path: path || 'root',
          message: `Value ${data} is less than minimum ${schemaObj.minimum}`
        });
      }
      if (schemaObj.maximum !== undefined && data > schemaObj.maximum) {
        errors.push({
          path: path || 'root',
          message: `Value ${data} exceeds maximum ${schemaObj.maximum}`
        });
      }
    }

    return errors;
  }, []);

  const handleValidation = useCallback(() => {
    if (!jsonData.trim() || !schema.trim()) {
      setIsValid(null);
      setErrors([]);
      setJsonWasCleaned(false);
      setSchemaWasCleaned(false);
      return;
    }

    const jsonResult = parseAndCleanJson(jsonData);
    const schemaResult = parseAndCleanJson(schema);
    
    setJsonWasCleaned(jsonResult.wasCleaned);
    setSchemaWasCleaned(schemaResult.wasCleaned);

    if (!jsonResult.isValid || !schemaResult.isValid) {
      setIsValid(false);
      setErrors([{
        path: 'parsing',
        message: !jsonResult.isValid ? 'Invalid JSON data' : 'Invalid JSON schema'
      }]);
      return;
    }

    try {
      const parsedData = JSON.parse(jsonResult.cleanedJson);
      const parsedSchema = JSON.parse(schemaResult.cleanedJson);
      
      const validationErrors = validateJsonSchema(parsedData, parsedSchema);
      
      setIsValid(validationErrors.length === 0);
      setErrors(validationErrors);
    } catch (error) {
      setIsValid(false);
      setErrors([{
        path: 'parsing',
        message: error instanceof Error ? error.message : 'Failed to parse JSON'
      }]);
    }
  }, [jsonData, schema, validateJsonSchema]);

  // Auto-validate when inputs change
  React.useEffect(() => {
    const timeoutId = setTimeout(handleValidation, 500);
    return () => clearTimeout(timeoutId);
  }, [handleValidation]);

  const handleCopy = async () => {
    const result = {
      valid: isValid,
      errors: errors
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setJsonData('');
    setSchema('');
    setIsValid(null);
    setErrors([]);
    setJsonWasCleaned(false);
    setSchemaWasCleaned(false);
  };

  const sampleSchema = `{
  "type": "object",
  "required": ["name", "email", "age"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "pattern": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    },
    "hobbies": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}`;

  const sampleData = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "hobbies": ["reading", "coding", "hiking"]
}`;

  const handleLoadSample = () => {
    setSchema(sampleSchema);
    setJsonData(sampleData);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON Schema Validator"
          description="Validate JSON data against a JSON Schema to ensure data structure and constraints."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Real-time validation</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Clear all"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {isValid !== null && (
          <div className="mb-6">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {isValid ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isValid ? 'Valid JSON Schema' : `Invalid: ${errors.length} error${errors.length !== 1 ? 's' : ''}`}
                </span>
                {(jsonWasCleaned || schemaWasCleaned) && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {jsonWasCleaned && schemaWasCleaned ? 'Both auto-cleaned' : jsonWasCleaned ? 'Data auto-cleaned' : 'Schema auto-cleaned'}
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy Result'}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* JSON Schema */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">JSON Schema</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder="Enter your JSON Schema here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* JSON Data */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">JSON Data</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Enter your JSON data to validate..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-red-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-red-800">Validation Errors</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-red-900">
                        Path: <code className="bg-red-100 px-1 rounded">{error.path}</code>
                      </div>
                      <div className="text-red-700 text-sm mt-1">
                        {error.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <InfoSection 
          title="JSON Schema Validation"
          items={[
            {
              label: "JSON Schema",
              description: "A vocabulary for validating JSON documents structure and constraints"
            },
            {
              label: "Supported validations",
              description: "Type checking, required properties, string patterns, number ranges, array items"
            },
            {
              label: "Real-time",
              description: "Validation happens automatically as you type (with a small delay)"
            },
            {
              label: "Note",
              description: "This is a simplified validator. For production use, consider libraries like Ajv"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default JsonSchemaValidator;