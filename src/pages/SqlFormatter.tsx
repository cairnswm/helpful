import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Database } from 'lucide-react';

const SqlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatSql = (sql: string): string => {
    if (!sql.trim()) return '';
    
    try {
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
        'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA',
        'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'DISTINCT',
        'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS'
      ];
      
      let formatted = sql
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      // Add line breaks before major keywords
      const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION'];
      majorKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword}`);
      });
      
      // Add line breaks before JOIN keywords
      const joinKeywords = ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'];
      joinKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword}`);
      });
      
      // Handle commas in SELECT statements
      formatted = formatted.replace(/,\s*(?![^()]*\))/g, ',\n    ');
      
      // Add proper indentation
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return '';
        
        // Decrease indent for closing parentheses
        if (trimmedLine.startsWith(')')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indentedLine = '  '.repeat(indentLevel) + trimmedLine;
        
        // Increase indent for opening parentheses
        if (trimmedLine.includes('(') && !trimmedLine.includes(')')) {
          indentLevel++;
        }
        
        return indentedLine;
      });
      
      return indentedLines.join('\n').trim();
    } catch (error) {
      return 'Error formatting SQL';
    }
  };

  const processInput = useCallback((value: string) => {
    if (!value.trim()) {
      setOutput('');
      return;
    }

    const result = formatSql(value);
    setOutput(result);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value);
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
  };

  const sampleSql = `SELECT u.id, u.name, u.email, p.title, p.created_at FROM users u INNER JOIN posts p ON u.id = p.user_id WHERE u.active = 1 AND p.published = 1 ORDER BY p.created_at DESC LIMIT 10;`;

  const handleLoadSample = () => {
    setInput(sampleSql);
    processInput(sampleSql);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="SQL Formatter"
          description="Format messy SQL queries for better readability and maintainability."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Supports standard SQL syntax</span>
          </div>
          
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            aria-label="Load sample SQL query"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="sql-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="sql-input-heading" className="text-lg font-semibold text-gray-800">SQL Input</h2>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                aria-label="Clear input"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="sql-input" className="sr-only">SQL query to format</label>
              <textarea
                id="sql-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your SQL query here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-label="SQL input"
              />
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="sql-output-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="sql-output-heading" className="text-lg font-semibold text-gray-800">Formatted SQL</h2>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={copied ? 'SQL copied to clipboard' : 'Copy formatted SQL to clipboard'}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                {output || 'Formatted SQL will appear here...'}
              </pre>
            </div>
          </section>
        </div>

        <InfoSection 
          title="SQL Formatting"
          items={[
            {
              label: "Keyword formatting",
              description: "Proper capitalization and line breaks for SQL keywords"
            },
            {
              label: "Indentation",
              description: "Consistent indentation for nested queries and clauses"
            },
            {
              label: "Column alignment",
              description: "Proper spacing for SELECT column lists"
            },
            {
              label: "Basic formatter",
              description: "This is a basic formatter. For complex queries, consider specialized SQL formatting tools"
            }
          ]}
          useCases="Database development, query optimization, code review, documentation"
        />
      </div>
    </div>
  );
};

export default SqlFormatter;