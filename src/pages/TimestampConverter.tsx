import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Clock, Calendar } from 'lucide-react';

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copied, setCopied] = useState<string | null>(null);

  // Update current time every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertTimestampToDate = useCallback((ts: string) => {
    if (!ts.trim()) return '';
    
    try {
      const num = parseInt(ts);
      if (isNaN(num)) return 'Invalid timestamp';
      
      // Handle both seconds and milliseconds
      const date = new Date(num.toString().length === 10 ? num * 1000 : num);
      
      if (isNaN(date.getTime())) return 'Invalid timestamp';
      
      return date.toISOString();
    } catch {
      return 'Invalid timestamp';
    }
  }, []);

  const convertDateToTimestamp = useCallback((dateStr: string) => {
    if (!dateStr.trim()) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return Math.floor(date.getTime() / 1000).toString();
    } catch {
      return 'Invalid date';
    }
  }, []);

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    const converted = convertTimestampToDate(value);
    setDateTime(converted);
  };

  const handleDateTimeChange = (value: string) => {
    setDateTime(value);
    const converted = convertDateToTimestamp(value);
    setTimestamp(converted);
  };

  const handleCopy = async (text: string, type: string) => {
    if (!text || text.includes('Invalid')) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setTimestamp('');
    setDateTime('');
  };

  const handleUseCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    setDateTime(new Date().toISOString());
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Timestamp Converter"
          description="Convert between Unix timestamps and human-readable dates."
        />

        {/* Current Time */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Current Time</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>Timestamp:</strong> {Math.floor(currentTime / 1000)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {formatDate(new Date(currentTime))}
                </p>
              </div>
            </div>
            <button
              onClick={handleUseCurrentTime}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Use Current Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timestamp to Date */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Unix Timestamp</h3>
              </div>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter timestamp (seconds or milliseconds)
                </label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => handleTimestampChange(e.target.value)}
                  placeholder="1640995200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Converted Date (ISO)
                  </label>
                  <button
                    onClick={() => handleCopy(dateTime, 'datetime')}
                    disabled={!dateTime || dateTime.includes('Invalid')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                      dateTime && !dateTime.includes('Invalid')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {copied === 'datetime' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'datetime' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {dateTime || 'Enter a timestamp above...'}
                </div>
              </div>

              {dateTime && !dateTime.includes('Invalid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Human Readable
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {formatDate(new Date(dateTime))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date to Timestamp */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Date to Timestamp</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter date/time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime.slice(0, 16)}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter date string
                </label>
                <input
                  type="text"
                  value={dateTime}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  placeholder="2022-01-01T00:00:00.000Z or 2022-01-01 12:00:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Unix Timestamp (seconds)
                  </label>
                  <button
                    onClick={() => handleCopy(timestamp, 'timestamp')}
                    disabled={!timestamp || timestamp.includes('Invalid')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                      timestamp && !timestamp.includes('Invalid')
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {copied === 'timestamp' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'timestamp' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  {timestamp || 'Enter a date above...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <InfoSection 
          title="Timestamp Conversion"
          items={[
            {
              label: "Unix Timestamp",
              description: "Number of seconds since January 1, 1970 UTC"
            },
            {
              label: "Milliseconds",
              description: "Some systems use milliseconds instead of seconds"
            },
            {
              label: "Supported formats",
              description: "ISO 8601, RFC 2822, and most common date formats"
            },
            {
              label: "Real-time",
              description: "Live current timestamp updates every second"
            }
          ]}
          useCases="API development, log analysis, database queries, system administration"
        />
      </div>
    </div>
  );
};

export default TimestampConverter;