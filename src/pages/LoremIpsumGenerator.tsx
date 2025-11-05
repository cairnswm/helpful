import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw } from 'lucide-react';

const LoremIpsumGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [format, setFormat] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'semper', 'tellus',
    'integer', 'feugiat', 'scelerisque', 'varius', 'morbi', 'turpis', 'cursus',
    'metus', 'vitae', 'tortor', 'condimentum', 'lacinia', 'quis', 'vel', 'eros',
    'donec', 'massa', 'sapien', 'faucibus', 'interdum', 'posuere', 'lorem',
    'dignissim', 'diam', 'maecenas', 'ultricies', 'mi', 'eget', 'mauris',
    'pharetra', 'magna', 'ac', 'placerat', 'vestibulum', 'lectus', 'proin',
    'nibh', 'nisl', 'condimentum', 'id', 'venenatis', 'a', 'condimentum'
  ];

  const generateWord = (): string => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = (minWords: number = 5, maxWords: number = 15): string => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = Array.from({ length: wordCount }, generateWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };

  const generateParagraph = (wordCount: number): string => {
    const sentences: string[] = [];
    let currentWords = 0;
    
    while (currentWords < wordCount) {
      const sentence = generateSentence();
      sentences.push(sentence);
      currentWords += sentence.split(' ').length;
    }
    
    return sentences.join(' ');
  };

  const generateLorem = () => {
    let result = '';

    switch (format) {
      case 'paragraphs': {
        const paraArray = Array.from({ length: paragraphs }, () => 
          generateParagraph(wordsPerParagraph)
        );
        result = paraArray.join('\n\n');
        break;
      }
      case 'sentences': {
        const sentenceArray = Array.from({ length: paragraphs }, () => 
          generateSentence()
        );
        result = sentenceArray.join(' ');
        break;
      }
      case 'words': {
        const wordArray = Array.from({ length: paragraphs }, generateWord);
        result = wordArray.join(' ');
        break;
      }
    }

    setOutput(result);
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
    setOutput('');
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Lorem Ipsum Generator"
          description="Generate placeholder text in various lengths and formats for mockups and testing."
        />

        <section className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="generator-options-heading">
          <h2 id="generator-options-heading" className="sr-only">Lorem Ipsum Generator Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as 'paragraphs' | 'sentences' | 'words')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select text format"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>

            <div>
              <label htmlFor="count-input" className="block text-sm font-medium text-gray-700 mb-2">
                {format === 'paragraphs' ? 'Number of Paragraphs' : 
                 format === 'sentences' ? 'Number of Sentences' : 'Number of Words'}
              </label>
              <input
                id="count-input"
                type="number"
                min="1"
                max="100"
                value={paragraphs}
                onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label={`Number of ${format}`}
              />
            </div>

            {format === 'paragraphs' && (
              <div>
                <label htmlFor="words-per-para" className="block text-sm font-medium text-gray-700 mb-2">
                  Words Per Paragraph
                </label>
                <input
                  id="words-per-para"
                  type="number"
                  min="10"
                  max="500"
                  value={wordsPerParagraph}
                  onChange={(e) => setWordsPerParagraph(parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Words per paragraph"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={generateLorem}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              aria-label="Generate lorem ipsum text"
            >
              Generate
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2"
              aria-label="Clear generated text"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-500px)] min-h-[300px]" aria-labelledby="generated-text-heading">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h2 id="generated-text-heading" className="text-lg font-semibold text-gray-800">Generated Text</h2>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                output
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label={copied ? 'Text copied to clipboard' : 'Copy text to clipboard'}
              title="Copy output"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              <span className="text-sm font-medium">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap" role="status" aria-live="polite">
              {output || 'Generated lorem ipsum text will appear here...'}
            </div>
          </div>
        </section>

        <InfoSection 
          title="About Lorem Ipsum Generator"
          items={[
            {
              label: "Paragraphs",
              description: "Generate multiple paragraphs of text with customizable word count"
            },
            {
              label: "Sentences",
              description: "Generate a specific number of sentences"
            },
            {
              label: "Words",
              description: "Generate a specific number of words"
            },
            {
              label: "Use Cases",
              description: "Perfect for mockups, wireframes, and testing layouts"
            }
          ]}
          useCases="web design mockups, content placeholders, UI testing, document templates"
        />
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;
