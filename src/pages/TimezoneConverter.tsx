import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Globe, Clock, MapPin } from 'lucide-react';
import cityTimezones from 'city-timezones';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

// Extend window interface for AccessElf
declare global {
  interface Window {
    AccessElf: {
      getLocationData: () => Promise<{ city?: string; country?: string; timezone?: string }>;
    };
  }
}

interface TimeZoneInfo {
  city: string;
  timezone: string;
  time: string;
  offset: string;
  isDST: boolean;
}

const TimezoneConverter: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [sourceTimezone, setSourceTimezone] = useState('UTC');
  const [targetTimezones, setTargetTimezones] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [timeZoneResults, setTimeZoneResults] = useState<TimeZoneInfo[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Get all available timezones
  const allTimezones = Intl.supportedValuesOf('timeZone');
  
  // Popular timezones for quick selection
  const popularTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  const convertTime = useCallback(() => {
    if (!selectedTime) return;

    const sourceDate = new Date(selectedTime);
    const results: TimeZoneInfo[] = [];

    // Add source timezone
    const sourceResult = formatTimeForTimezone(sourceDate, sourceTimezone, 'Source');
    if (sourceResult) results.push(sourceResult);

    // Add target timezones
    targetTimezones.forEach(tz => {
      const result = formatTimeForTimezone(sourceDate, tz);
      if (result) results.push(result);
    });

    setTimeZoneResults(results);
  }, [selectedTime, sourceTimezone, targetTimezones]);

  const formatTimeForTimezone = (date: Date, timezone: string, label?: string): TimeZoneInfo | null => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const offsetFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });

      const time = formatter.format(date);
      const offsetParts = offsetFormatter.formatToParts(date);
      const offset = offsetParts.find(part => part.type === 'timeZoneName')?.value || '';

      // Check if DST is active (simplified check)
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);
      const janOffset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' })
        .formatToParts(jan).find(part => part.type === 'timeZoneName')?.value || '';
      const julOffset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' })
        .formatToParts(jul).find(part => part.type === 'timeZoneName')?.value || '';
      
      const isDST = offset !== janOffset || offset !== julOffset;

      return {
        city: label || timezone.split('/').pop()?.replace(/_/g, ' ') || timezone,
        timezone,
        time,
        offset,
        isDST
      };
    } catch (error) {
      console.error('Error formatting timezone:', error);
      return null;
    }
  };

  const searchCities = useCallback((query: string) => {
    if (!query.trim()) {
      setCityResults([]);
      return;
    }

    const results = cityTimezones.findFromCityStateProvince(query);
    setCityResults(results.slice(0, 10)); // Limit to 10 results
  }, []);

  const handleCitySearch = (value: string) => {
    setSearchCity(value);
    searchCities(value);
  };

  const addTimezoneFromCity = (cityData: any) => {
    if (cityData.timezone && !targetTimezones.includes(cityData.timezone)) {
      setTargetTimezones([...targetTimezones, cityData.timezone]);
    }
    setSearchCity('');
    setCityResults([]);
  };

  const removeTimezone = (timezone: string) => {
    setTargetTimezones(targetTimezones.filter(tz => tz !== timezone));
  };

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
    setSelectedTime(new Date().toISOString().slice(0, 16));
    setSourceTimezone('UTC');
    setTargetTimezones(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
    setTimeZoneResults([]);
  };

  const handleUseCurrentTime = () => {
    const now = new Date();
    setSelectedTime(now.toISOString().slice(0, 16));
  };

  const detectCurrentLocation = async () => {
    try {
      const locationData = await window.AccessElf.getLocationData();
      if (!locationData?.city) {
        alert('Unable to detect your location. Please search for your city manually.');
        return;
      }

      // Find timezone for the detected city
      const cityData = cityTimezones.findFromCityStateProvince(locationData.city);
      if (cityData.length > 0) {
        const timezone = cityData[0].timezone;
        setSourceTimezone(timezone);
        
        // Also add to target timezones if not already present
        if (!targetTimezones.includes(timezone)) {
          setTargetTimezones([timezone, ...targetTimezones]);
        }
      } else {
        alert(`Found your city (${locationData.city}) but couldn't determine the timezone. Please select manually.`);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Unable to detect your location. Please ensure location access is enabled.');
    }
  };

  // Auto-convert when inputs change
  React.useEffect(() => {
    convertTime();
  }, [convertTime]);

  // Auto-detect location on page load
  React.useEffect(() => {
    detectCurrentLocation();
  }, []);

  const copyAllResults = () => {
    const allResults = timeZoneResults.map(result => 
      `${result.city}: ${result.time} (${result.offset})`
    ).join('\n');
    handleCopy(allResults, 'all-results');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Timezone Converter"
          description="Convert time between different timezones and find timezone information for cities worldwide."
        />

        {/* Time Input */}
        <section aria-labelledby="time-input-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 id="time-input-heading" className="text-lg font-semibold text-gray-800">Time & Source Timezone</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUseCurrentTime}
                aria-label="Use current time"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Use Current Time
              </button>
              <button
                onClick={handleClear}
                aria-label="Reset to defaults"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Reset to defaults"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="datetime-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  id="datetime-input"
                  type="datetime-local"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  aria-label="Select date and time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="source-timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Timezone
                </label>
                <select
                  id="source-timezone"
                  value={sourceTimezone}
                  onChange={(e) => setSourceTimezone(e.target.value)}
                  aria-label="Select source timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {popularTimezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                  <optgroup label="All Timezones">
                    {allTimezones.filter(tz => !popularTimezones.includes(tz)).map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* City Search */}
        <section aria-labelledby="city-search-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" aria-hidden="true" />
              <h2 id="city-search-heading" className="text-lg font-semibold text-gray-800">Add Timezone by City</h2>
            </div>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <label htmlFor="city-search-input" className="sr-only">Search for a city</label>
              <input
                id="city-search-input"
                type="text"
                value={searchCity}
                onChange={(e) => handleCitySearch(e.target.value)}
                aria-label="Search for a city"
                placeholder="Search for a city (e.g., New York, London, Tokyo)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {cityResults.length > 0 && (
                <div role="list" aria-label="City search results" className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {cityResults.map((city, index) => (
                    <button
                      key={index}
                      role="listitem"
                      onClick={() => addTimezoneFromCity(city)}
                      aria-label={`Add ${city.city}, ${city.province || city.country} - ${city.timezone}`}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {city.city}, {city.province || city.country}
                      </div>
                      <div className="text-sm text-gray-600">
                        {city.timezone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Target Timezones */}
        <section aria-labelledby="target-timezones-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" aria-hidden="true" />
              <h2 id="target-timezones-heading" className="text-lg font-semibold text-gray-800">Target Timezones</h2>
            </div>
            {timeZoneResults.length > 1 && (
              <button
                onClick={copyAllResults}
                aria-label={copied === 'all-results' ? 'All results copied to clipboard' : 'Copy all results to clipboard'}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                {copied === 'all-results' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span>{copied === 'all-results' ? 'Copied!' : 'Copy All'}</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            <div role="list" aria-label="Selected target timezones" className="flex flex-wrap gap-2 mb-4">
              {targetTimezones.map((tz) => (
                <div
                  key={tz}
                  role="listitem"
                  className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{tz}</span>
                  <button
                    onClick={() => removeTimezone(tz)}
                    aria-label={`Remove ${tz} from target timezones`}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div>
              <label htmlFor="add-timezone-select" className="block text-sm font-medium text-gray-700 mb-2">
                Add Timezone Manually
              </label>
              <select
                id="add-timezone-select"
                onChange={(e) => {
                  if (e.target.value && !targetTimezones.includes(e.target.value)) {
                    setTargetTimezones([...targetTimezones, e.target.value]);
                  }
                  e.target.value = '';
                }}
                aria-label="Select a timezone to add"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a timezone to add...</option>
                <optgroup label="Popular Timezones">
                  {popularTimezones.filter(tz => !targetTimezones.includes(tz)).map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </optgroup>
                <optgroup label="All Timezones">
                  {allTimezones.filter(tz => !popularTimezones.includes(tz) && !targetTimezones.includes(tz)).map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </section>

        {/* Results */}
        <section aria-labelledby="results-heading" className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h2 id="results-heading" className="text-lg font-semibold text-gray-800">Converted Times</h2>
          </div>
          
          <div className="p-4">
            {timeZoneResults.length > 0 ? (
              <div role="list" aria-label="Converted timezone results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeZoneResults.map((result, index) => (
                  <div
                    key={index}
                    role="listitem"
                    className={`p-4 rounded-lg border ${
                      index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className={`h-4 w-4 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`} aria-hidden="true" />
                        <h3 className={`font-semibold ${index === 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                          {result.city}
                          {index === 0 && <span className="text-xs ml-2 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Source</span>}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCopy(result.time, `time-${index}`)}
                        aria-label={copied === `time-${index}` ? 'Time copied to clipboard' : `Copy time for ${result.city}`}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        {copied === `time-${index}` ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                        <span>{copied === `time-${index}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <div className={`text-lg font-mono ${index === 0 ? 'text-blue-800' : 'text-gray-800'}`}>
                        {result.time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.timezone}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{result.offset}</span>
                        {result.isDST && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            DST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div role="status" className="text-center py-8 text-gray-500">
                Select a time and timezones to see conversions...
              </div>
            )}
          </div>
        </section>
        {copied && (
          <div role="status" aria-live="polite" className="sr-only">
            {copied === 'all-results' ? 'All results copied to clipboard' : 'Time copied to clipboard'}
          </div>
        )}

        <InfoSection 
          title="Timezone Conversion Features"
          items={[
            {
              label: "City Search",
              description: "Find timezones by searching for city names worldwide"
            },
            {
              label: "DST Detection",
              description: "Automatically detects daylight saving time status"
            },
            {
              label: "UTC Offsets",
              description: "Shows current UTC offset for each timezone"
            },
            {
              label: "Real-time",
              description: "Conversions update automatically as you change the time"
            },
            {
              label: "Copy Options",
              description: "Copy individual times or all results at once"
            }
          ]}
          useCases="International meetings, travel planning, global team coordination, scheduling"
        />
      </div>
    </div>
  );
};

export default TimezoneConverter;