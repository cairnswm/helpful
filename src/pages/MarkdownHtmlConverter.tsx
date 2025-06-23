import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download, Eye, Edit } from 'lucide-react';
import { marked } from 'marked';
import "./Markdown.css";

const MarkdownHtmlConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'markdownToHtml' | 'htmlToMarkdown'>('markdownToHtml');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });

  const markdownToHtml = (markdownString: string): string => {
    try {
      return marked(markdownString);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert Markdown to HTML');
    }
  };

  const htmlToMarkdown = (htmlString: string): string => {
    try {
      // Basic HTML to Markdown conversion
      let markdown = htmlString
        // Headers
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
        .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
        .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
        
        // Bold and italic
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        
        // Links
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
        
        // Images
        .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
        .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)')
        .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
        
        // Code
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
        .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n')
        .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n')
        
        // Lists
        .replace(/<ul[^>]*>/gi, '')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
        
        // Blockquotes
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
          return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
        })
        
        // Horizontal rule
        .replace(/<hr[^>]*\/?>/gi, '---\n\n')
        
        // Line breaks
        .replace(/<br[^>]*\/?>/gi, '\n')
        
        // Paragraphs
        .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
        
        // Remove remaining HTML tags
        .replace(/<[^>]*>/g, '')
        
        // Clean up extra whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      return markdown;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert HTML to Markdown');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'markdownToHtml' | 'htmlToMarkdown') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'markdownToHtml') {
        const result = markdownToHtml(value);
        setOutput(result);
        setError('');
      } else {
        const result = htmlToMarkdown(value);
        setOutput(result);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'markdownToHtml' ? 'htmlToMarkdown' : 'markdownToHtml';
    setMode(newMode);
    setInput(output);
    processInput(output, newMode);
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

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { 
      type: mode === 'markdownToHtml' ? 'text/html' : 'text/markdown' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'markdownToHtml' ? 'document.html' : 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const sampleMarkdown = `# Welcome to Markdown

This is a **comprehensive** example of *Markdown* syntax.

## Features

- **Bold text** and *italic text*
- [Links](https://example.com)
- \`inline code\` and code blocks
- Lists and more!

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item
- Last item

### Blockquote

> This is a blockquote
> It can span multiple lines

### Horizontal Rule

---

**Note:** This demonstrates various Markdown features.`;

  const sampleHtml = `<h1>Welcome to HTML</h1>

<p>This is a <strong>comprehensive</strong> example of <em>HTML</em> markup.</p>

<h2>Features</h2>

<ul>
<li><strong>Bold text</strong> and <em>italic text</em></li>
<li><a href="https://example.com">Links</a></li>
<li><code>inline code</code> and code blocks</li>
<li>Lists and more!</li>
</ul>

<h3>Code Example</h3>

<pre><code class="language-javascript">function hello() {
  console.log("Hello, World!");
}
</code></pre>

<h3>Lists</h3>

<ol>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
</ol>

<h3>Blockquote</h3>

<blockquote>
<p>This is a blockquote<br>
It can span multiple lines</p>
</blockquote>

<h3>Horizontal Rule</h3>

<hr>

<p><strong>Note:</strong> This demonstrates various HTML features.</p>`;

  const handleLoadSample = () => {
    const sample = mode === 'markdownToHtml' ? sampleMarkdown : sampleHtml;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown ↔ HTML Converter</h1>
          <p className="text-gray-600">
            Convert between Markdown and HTML formats with live preview and syntax support.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('markdownToHtml');
                  processInput(input, 'markdownToHtml');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'markdownToHtml'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Markdown to HTML
              </button>
              <button
                onClick={() => {
                  setMode('htmlToMarkdown');
                  processInput(input, 'htmlToMarkdown');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'htmlToMarkdown'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                HTML to Markdown
              </button>
            </div>
            
            <button
              onClick={handleModeToggle}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Swap input and output"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Swap</span>
            </button>
          </div>
          
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'markdownToHtml' ? 'Markdown Input' : 'HTML Input'}
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
                placeholder={
                  mode === 'markdownToHtml' 
                    ? 'Enter Markdown to convert to HTML...\n\nExample:\n# Heading\n**Bold text** and *italic text*\n- List item\n- Another item'
                    : 'Enter HTML to convert to Markdown...\n\nExample:\n<h1>Heading</h1>\n<p><strong>Bold text</strong> and <em>italic text</em></p>\n<ul>\n<li>List item</li>\n<li>Another item</li>\n</ul>'
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {mode === 'markdownToHtml' ? 'HTML Output' : 'Markdown Output'}
                </h3>
                {mode === 'markdownToHtml' && output && (
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        viewMode === 'code'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Edit className="h-3 w-3" />
                      <span>Code</span>
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
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
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : output ? (
                mode === 'markdownToHtml' && viewMode === 'preview' ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: output }}
                  />
                ) : (
                  <textarea
                    value={output}
                    readOnly
                    className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                  />
                )
              ) : (
                <div className="text-gray-500 text-sm">
                  {`${mode === 'markdownToHtml' ? 'HTML' : 'Markdown'} output will appear here...`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Markdown ↔ HTML Conversion</h4>
          <div className="text-sm text-indigo-800 space-y-1">
            <p><strong>Markdown:</strong> Lightweight markup language for creating formatted text using plain text syntax</p>
            <p><strong>HTML:</strong> Standard markup language for creating web pages and web applications</p>
            <p><strong>Features:</strong> Supports headers, lists, links, images, code blocks, and more</p>
            <p><strong>Use cases:</strong> Documentation, README files, blog posts, static site generation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownHtmlConverter;