import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, BarChart3, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface AnalysisResult {
  type: 'info' | 'warning' | 'error' | 'suggestion';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

const SqlQueryAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  const [copied, setCopied] = useState(false);

  const analyzeQuery = useCallback((sql: string) => {
    if (!sql.trim()) {
      setAnalysis([]);
      return;
    }

    const results: AnalysisResult[] = [];
    const lines = sql.split('\n');
    const upperSql = sql.toUpperCase();

    // Basic SQL structure analysis
    if (!upperSql.includes('SELECT') && !upperSql.includes('INSERT') && 
        !upperSql.includes('UPDATE') && !upperSql.includes('DELETE') &&
        !upperSql.includes('CREATE') && !upperSql.includes('ALTER') &&
        !upperSql.includes('DROP')) {
      results.push({
        type: 'error',
        message: 'No valid SQL statement detected',
        severity: 'high'
      });
    }

    // SELECT statement analysis
    if (upperSql.includes('SELECT')) {
      // Check for SELECT *
      if (upperSql.includes('SELECT *')) {
        results.push({
          type: 'warning',
          message: 'Avoid using SELECT * in production queries. Specify column names explicitly for better performance and maintainability.',
          severity: 'medium'
        });
      }

      // Check for missing WHERE clause in SELECT
      if (upperSql.includes('SELECT') && !upperSql.includes('WHERE') && !upperSql.includes('LIMIT')) {
        results.push({
          type: 'warning',
          message: 'Consider adding a WHERE clause or LIMIT to prevent returning all rows',
          severity: 'medium'
        });
      }

      // Check for ORDER BY without LIMIT
      if (upperSql.includes('ORDER BY') && !upperSql.includes('LIMIT')) {
        results.push({
          type: 'suggestion',
          message: 'Consider adding LIMIT when using ORDER BY to improve performance',
          severity: 'low'
        });
      }
    }

    // UPDATE/DELETE analysis
    if (upperSql.includes('UPDATE') || upperSql.includes('DELETE')) {
      if (!upperSql.includes('WHERE')) {
        results.push({
          type: 'error',
          message: 'UPDATE/DELETE without WHERE clause will affect all rows. This is dangerous!',
          severity: 'high'
        });
      }
    }

    // JOIN analysis
    const joinCount = (upperSql.match(/JOIN/g) || []).length;
    if (joinCount > 5) {
      results.push({
        type: 'warning',
        message: `Query has ${joinCount} JOINs. Consider breaking into smaller queries or using subqueries for better performance.`,
        severity: 'medium'
      });
    }

    // Check for implicit JOINs (comma-separated tables)
    if (upperSql.includes('FROM') && upperSql.includes(',') && !upperSql.includes('IN (')) {
      results.push({
        type: 'suggestion',
        message: 'Consider using explicit JOIN syntax instead of comma-separated tables for better readability',
        severity: 'low'
      });
    }

    // Subquery analysis
    const subqueryCount = (upperSql.match(/\(/g) || []).length;
    if (subqueryCount > 3) {
      results.push({
        type: 'warning',
        message: 'Complex nested subqueries detected. Consider using CTEs (WITH clause) for better readability.',
        severity: 'medium'
      });
    }

    // Index hints
    if (upperSql.includes('LIKE') && upperSql.includes("'%")) {
      results.push({
        type: 'warning',
        message: 'LIKE with leading wildcard (%) cannot use indexes efficiently',
        severity: 'medium'
      });
    }

    // Function usage in WHERE
    if (upperSql.match(/WHERE.*[A-Z_]+\(/)) {
      results.push({
        type: 'warning',
        message: 'Functions in WHERE clause may prevent index usage. Consider restructuring the query.',
        severity: 'medium'
      });
    }

    // DISTINCT usage
    if (upperSql.includes('DISTINCT')) {
      results.push({
        type: 'info',
        message: 'DISTINCT can be expensive. Ensure it\'s necessary and consider if GROUP BY might be more appropriate.',
        severity: 'low'
      });
    }

    // UNION vs UNION ALL
    if (upperSql.includes('UNION ') && !upperSql.includes('UNION ALL')) {
      results.push({
        type: 'suggestion',
        message: 'Consider using UNION ALL instead of UNION if duplicates are not a concern (better performance)',
        severity: 'low'
      });
    }

    // Syntax issues
    lines.forEach((line, index) => {
      const trimmedLine = line.trim().toUpperCase();
      
      // Check for missing semicolon at end
      if (index === lines.length - 1 && trimmedLine && !trimmedLine.endsWith(';')) {
        results.push({
          type: 'suggestion',
          message: 'Consider adding semicolon at the end of the statement',
          line: index + 1,
          severity: 'low'
        });
      }

      // Check for potential SQL injection patterns
      if (line.includes("' +") || line.includes('" +') || line.includes('${')) {
        results.push({
          type: 'error',
          message: 'Potential SQL injection vulnerability detected. Use parameterized queries.',
          line: index + 1,
          severity: 'high'
        });
      }
    });

    // Performance suggestions
    if (upperSql.includes('COUNT(*)')) {
      results.push({
        type: 'suggestion',
        message: 'For large tables, consider using COUNT(1) or approximate count functions if exact count is not required',
        severity: 'low'
      });
    }

    // Positive feedback
    if (results.length === 0 || results.every(r => r.severity === 'low')) {
      results.push({
        type: 'info',
        message: 'Query looks good! No major issues detected.',
        severity: 'low'
      });
    }

    setAnalysis(results);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    analyzeQuery(value);
  };

  const handleCopy = async () => {
    const report = analysis.map(item => 
      `${item.type.toUpperCase()}: ${item.message}${item.line ? ` (Line ${item.line})` : ''}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setAnalysis([]);
  };

  const loadSampleQuery = () => {
    const sample = `SELECT *
FROM users u, orders o, products p
WHERE u.id = o.user_id
  AND o.product_id = p.id
  AND UPPER(u.name) LIKE '%JOHN%'
  AND o.created_at > '2023-01-01'
ORDER BY o.created_at DESC`;
    
    setInput(sample);
    analyzeQuery(sample);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'suggestion': return <Info className="h-5 w-5 text-blue-500" />;
      case 'info': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'suggestion': return 'bg-blue-50 border-blue-200';
      case 'info': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const severityStats = {
    high: analysis.filter(a => a.severity === 'high').length,
    medium: analysis.filter(a => a.severity === 'medium').length,
    low: analysis.filter(a => a.severity === 'low').length
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="SQL Query Analyzer"
          description="Analyze SQL queries for performance optimization, best practices, and potential issues."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">SQL Query</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSampleQuery}
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
                placeholder="Enter your SQL query here for analysis..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
              {analysis.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    {severityStats.high > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {severityStats.high} High
                      </span>
                    )}
                    {severityStats.medium > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {severityStats.medium} Medium
                      </span>
                    )}
                    {severityStats.low > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {severityStats.low} Low
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Report'}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {analysis.length > 0 ? (
                <div className="space-y-3">
                  {analysis.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getResultColor(result.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getResultIcon(result.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium capitalize">
                              {result.type}
                            </span>
                            {result.line && (
                              <span className="text-xs text-gray-500">
                                Line {result.line}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              result.severity === 'high' ? 'bg-red-100 text-red-700' :
                              result.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {result.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {result.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a SQL query above to see analysis results...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Practices Guide */}
        <InfoSection 
          title="SQL Performance Best Practices"
          items={[
            {
              label: "Query Structure",
              description: "Use explicit column names, WHERE clauses, LIMIT, and explicit JOINs"
            },
            {
              label: "Performance",
              description: "Avoid functions in WHERE clauses, use indexes effectively, prefer UNION ALL"
            },
            {
              label: "Security",
              description: "Use parameterized queries, validate input, and appropriate permissions"
            }
          ]}
          useCases="Database optimization, query tuning, performance analysis, code review"
        />
      </div>
    </div>
  );
};

export default SqlQueryAnalyzer;