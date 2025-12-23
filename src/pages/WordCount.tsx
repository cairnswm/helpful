import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface TextStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  charactersNoPunctuation: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

const WordCount: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const calculateStatistics = useCallback((input: string): TextStatistics => {
    if (!input.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        charactersNoPunctuation: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0,
      };
    }

    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    const charactersNoPunctuation = input.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim().length;

    const words = input.trim().split(/\s+/).filter(word => word.length > 0).length;

    const sentences = input
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0).length;

    const paragraphs = input
      .split(/\n\s*\n/)
      .filter(para => para.trim().length > 0).length;

    const readingTime = Math.ceil(words / 225);
    const speakingTime = Math.ceil(words / 150);

    return {
      words,
      characters,
      charactersNoSpaces,
      charactersNoPunctuation,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
    };
  }, []);

  const stats = calculateStatistics(text);

  const handleCopy = async () => {
    if (!text) return;

    try {
      const statsText = `Text Statistics:
Words: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Characters (no punctuation): ${stats.charactersNoPunctuation}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading Time: ${stats.readingTime} min
Speaking Time: ${stats.speakingTime} min

---
${text}`;

      await navigator.clipboard.writeText(statsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium!`;

  const handleLoadSample = () => {
    setText(sampleText);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Word Count"
          description="Analyze text with word count, character counts, reading time, and more detailed statistics."
        />

        <div className="mb-6 flex items-center justify-end">
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            aria-label="Load sample text"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-320px)]">
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="text-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="text-input-heading" className="text-lg font-semibold text-gray-800">Text Input</h2>
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
              <label htmlFor="text-input" className="sr-only">Text to analyze</label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here to analyze word count, character count, and other statistics..."
                className="w-full h-full resize-none border-0 outline-none text-sm leading-relaxed"
                spellCheck={false}
                aria-label="Text input for analysis"
              />
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="statistics-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="statistics-heading" className="text-lg font-semibold text-gray-800">
                Text Statistics
              </h2>
              <button
                onClick={handleCopy}
                disabled={!text}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  text
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={copied ? 'Statistics copied to clipboard' : 'Copy statistics to clipboard'}
                title="Copy statistics"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {!text.trim() ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                    <p className="text-sm">Enter text to see statistics</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{stats.words.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 font-medium">Words</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-3xl font-bold text-green-600 mb-1">{stats.sentences.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 font-medium">Sentences</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Character Counts</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Characters</span>
                        <span className="text-lg font-semibold text-gray-800">{stats.characters.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Characters (no spaces)</span>
                        <span className="text-lg font-semibold text-gray-800">{stats.charactersNoSpaces.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Characters (no punctuation)</span>
                        <span className="text-lg font-semibold text-gray-800">{stats.charactersNoPunctuation.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Structure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Paragraphs</span>
                        <span className="text-lg font-semibold text-gray-800">{stats.paragraphs.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Time Estimates</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Reading Time</span>
                        <span className="text-lg font-semibold text-purple-600">{formatTime(stats.readingTime)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Speaking Time</span>
                        <span className="text-lg font-semibold text-orange-600">{formatTime(stats.speakingTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">
                      Reading time based on average speed of 225 words/minute.
                      Speaking time based on average speed of 150 words/minute.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <InfoSection
          title="Text Analysis Features"
          items={[
            {
              label: "Word Count",
              description: "Counts all words separated by whitespace, excluding empty strings"
            },
            {
              label: "Character Counts",
              description: "Total characters, characters excluding spaces, and characters excluding punctuation"
            },
            {
              label: "Structure Analysis",
              description: "Counts sentences (split by .!?) and paragraphs (separated by blank lines)"
            },
            {
              label: "Time Estimates",
              description: "Reading time (225 wpm) and speaking time (150 wpm) based on industry averages"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default WordCount;
