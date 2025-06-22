import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Eye, Edit } from 'lucide-react';

const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');

  // Simple markdown to HTML converter
  const convertMarkdownToHtml = useCallback((md: string): string => {
    if (!md.trim()) return '';

    let html = md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      
      // Horizontal rule
      .replace(/^---$/gim, '<hr>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // Unordered lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap consecutive <li> elements in <ul> or <ol>
    html = html.replace(/(<li>.*?<\/li>)(<br>)*(?=<li>|$)/g, (match, li) => {
      return li;
    });
    
    // Wrap list items
    html = html.replace(/(<li>.*?<\/li>(<br>)*)+/g, (match) => {
      const items = match.replace(/<br>/g, '');
      return `<ul>${items}</ul>`;
    });

    return html;
  }, []);

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const sampleMarkdown = `# Welcome to Markdown Previewer

This is a **live preview** of your markdown content.

## Features

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://example.com)
- Lists and more!

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

- Item 1
- Item 2
- Item 3

1. First item
2. Second item
3. Third item

### Blockquote

> This is a blockquote
> It can span multiple lines

### Horizontal Rule

---

**Note:** This is a simplified markdown parser for demonstration purposes.`;

  const handleLoadSample = () => {
    setMarkdown(sampleMarkdown);
  };

  const htmlContent = convertMarkdownToHtml(markdown);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown Previewer</h1>
          <p className="text-gray-600">
            Write markdown and see the live preview with syntax highlighting.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('edit')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'edit'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setView('split')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'split'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Split</span>
              </button>
              <button
                onClick={() => setView('preview')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
            </div>
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
              title="Clear content"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={`grid gap-6 h-[calc(100vh-320px)] ${
          view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* Editor */}
          {(view === 'edit' || view === 'split') && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Markdown Editor</h3>
                </div>
                <button
                  onClick={() => handleCopy(markdown, 'markdown')}
                  disabled={!markdown}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    markdown
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy markdown"
                >
                  {copied === 'markdown' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {copied === 'markdown' ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
              
              <div className="flex-1 p-4">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your markdown here..."
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {(view === 'preview' || view === 'split') && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                </div>
                <button
                  onClick={() => handleCopy(htmlContent, 'html')}
                  disabled={!htmlContent}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    htmlContent
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy HTML"
                >
                  {copied === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {copied === 'html' ? 'Copied!' : 'Copy HTML'}
                  </span>
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-auto">
                {htmlContent ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{
                      lineHeight: '1.6',
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-sm">
                    Markdown preview will appear here...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Markdown Cheatsheet */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Markdown Syntax Quick Reference</h4>
          <div className="text-sm text-blue-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p><code># Header 1</code></p>
              <p><code>## Header 2</code></p>
              <p><code>### Header 3</code></p>
            </div>
            <div>
              <p><code>**bold text**</code></p>
              <p><code>*italic text*</code></p>
              <p><code>`inline code`</code></p>
            </div>
            <div>
              <p><code>[link](url)</code></p>
              <p><code>![image](url)</code></p>
              <p><code>- list item</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;