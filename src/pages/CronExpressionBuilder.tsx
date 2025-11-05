import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, Clock } from 'lucide-react';

const CronExpressionBuilder: React.FC = () => {
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('0');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [copied, setCopied] = useState(false);

  const parseCronExpression = useCallback((expression: string) => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length >= 5) {
      setMinute(parts[0] || '0');
      setHour(parts[1] || '0');
      setDayOfMonth(parts[2] || '*');
      setMonth(parts[3] || '*');
      setDayOfWeek(parts[4] || '*');
    }
  }, []);

  const buildCronExpression = useCallback(() => {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const getHumanReadable = useCallback((expression: string): string => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5) return 'Invalid cron expression';

    const [min, hr, dom, mon, dow] = parts;
    const descriptions: string[] = [];

    // Minute
    if (min === '*') {
      descriptions.push('every minute');
    } else if (min.includes('/')) {
      const interval = min.split('/')[1];
      descriptions.push(`every ${interval} minute(s)`);
    } else if (min.includes(',')) {
      descriptions.push(`at minute(s) ${min}`);
    } else {
      descriptions.push(`at minute ${min}`);
    }

    // Hour
    if (hr === '*') {
      descriptions.push('of every hour');
    } else if (hr.includes('/')) {
      const interval = hr.split('/')[1];
      descriptions.push(`every ${interval} hour(s)`);
    } else if (hr.includes(',')) {
      descriptions.push(`at hour(s) ${hr}`);
    } else {
      const hourNum = parseInt(hr);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      descriptions.push(`at ${displayHour}:${min.padStart(2, '0')} ${period}`);
    }

    // Day of month
    if (dom === '*') {
      descriptions.push('on every day');
    } else if (dom.includes('/')) {
      const interval = dom.split('/')[1];
      descriptions.push(`every ${interval} day(s)`);
    } else if (dom.includes(',')) {
      descriptions.push(`on day(s) ${dom} of the month`);
    } else {
      descriptions.push(`on day ${dom} of the month`);
    }

    // Month
    if (mon !== '*') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (mon.includes(',')) {
        const months = mon.split(',').map(m => monthNames[parseInt(m) - 1] || m).join(', ');
        descriptions.push(`in ${months}`);
      } else {
        const monthName = monthNames[parseInt(mon) - 1] || mon;
        descriptions.push(`in ${monthName}`);
      }
    }

    // Day of week
    if (dow !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (dow.includes(',')) {
        const days = dow.split(',').map(d => dayNames[parseInt(d)] || d).join(', ');
        descriptions.push(`on ${days}`);
      } else {
        const dayName = dayNames[parseInt(dow)] || dow;
        descriptions.push(`on ${dayName}`);
      }
    }

    return descriptions.join(' ');
  }, []);

  const getNextRunTimes = useCallback((expression: string, count: number = 5): string[] => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5) return ['Invalid cron expression'];

    const [minPart, hrPart, domPart, monPart, dowPart] = parts;
    const now = new Date();
    const times: string[] = [];
    
    const parseField = (field: string, max: number): number[] => {
      if (field === '*') {
        return Array.from({ length: max + 1 }, (_, i) => i);
      }
      if (field.includes('/')) {
        const [, step] = field.split('/');
        const stepNum = parseInt(step);
        const result = [];
        for (let i = 0; i <= max; i += stepNum) {
          result.push(i);
        }
        return result;
      }
      if (field.includes(',')) {
        return field.split(',').map(v => parseInt(v));
      }
      if (field.includes('-')) {
        const [start, end] = field.split('-').map(v => parseInt(v));
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [parseInt(field)];
    };

    const validMinutes = parseField(minPart, 59);
    const validHours = parseField(hrPart, 23);
    const validDaysOfMonth = domPart === '*' ? null : parseField(domPart, 31);
    const validMonths = monPart === '*' ? null : parseField(monPart, 12).map(m => m - 1); // JS months are 0-indexed
    const validDaysOfWeek = dowPart === '*' ? null : parseField(dowPart, 6);

    const current = new Date(now);
    current.setSeconds(0, 0);
    
    while (times.length < count) {
      current.setMinutes(current.getMinutes() + 1);
      
      const minute = current.getMinutes();
      const hour = current.getHours();
      const dayOfMonth = current.getDate();
      const month = current.getMonth();
      const dayOfWeek = current.getDay();
      
      if (!validMinutes.includes(minute)) continue;
      if (!validHours.includes(hour)) continue;
      if (validDaysOfMonth && !validDaysOfMonth.includes(dayOfMonth)) continue;
      if (validMonths && !validMonths.includes(month)) continue;
      if (validDaysOfWeek && !validDaysOfWeek.includes(dayOfWeek)) continue;
      
      times.push(current.toLocaleString());
    }

    return times;
  }, []);

  const handleCronExpressionChange = (value: string) => {
    setCronExpression(value);
    parseCronExpression(value);
  };

  const handleFieldChange = () => {
    const newExpression = buildCronExpression();
    setCronExpression(newExpression);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const presetSchedules = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every day at noon', value: '0 12 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'First day of month', value: '0 0 1 * *' },
  ];

  const loadPreset = (value: string) => {
    setCronExpression(value);
    parseCronExpression(value);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Cron Expression Builder"
          description="Visual interface to build and validate cron expressions with human-readable explanations and next run times."
        />

        {/* Cron Expression Input */}
        <section className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="cron-input-heading">
          <div className="mb-4">
            <label htmlFor="cron-expression" className="block text-sm font-medium text-gray-700 mb-2">
              Cron Expression
            </label>
            <div className="flex space-x-2">
              <input
                id="cron-expression"
                type="text"
                value={cronExpression}
                onChange={(e) => handleCronExpressionChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0 0 * * *"
                aria-label="Cron expression input"
              />
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Cron expression copied to clipboard' : 'Copy cron expression to clipboard'}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4" role="group" aria-label="Cron expression field controls">
            <div>
              <label htmlFor="minute-field" className="block text-sm font-medium text-gray-700 mb-2">
                Minute (0-59)
              </label>
              <input
                id="minute-field"
                type="text"
                value={minute}
                onChange={(e) => {
                  setMinute(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
                aria-label="Minute field - enter 0-59 or * for every minute"
              />
            </div>
            <div>
              <label htmlFor="hour-field" className="block text-sm font-medium text-gray-700 mb-2">
                Hour (0-23)
              </label>
              <input
                id="hour-field"
                type="text"
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
                aria-label="Hour field - enter 0-23 or * for every hour"
              />
            </div>
            <div>
              <label htmlFor="day-field" className="block text-sm font-medium text-gray-700 mb-2">
                Day (1-31)
              </label>
              <input
                id="day-field"
                type="text"
                value={dayOfMonth}
                onChange={(e) => {
                  setDayOfMonth(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
                aria-label="Day of month field - enter 1-31 or * for every day"
              />
            </div>
            <div>
              <label htmlFor="month-field" className="block text-sm font-medium text-gray-700 mb-2">
                Month (1-12)
              </label>
              <input
                id="month-field"
                type="text"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
                aria-label="Month field - enter 1-12 or * for every month"
              />
            </div>
            <div>
              <label htmlFor="dow-field" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week (0-6)
              </label>
              <input
                id="dow-field"
                type="text"
                value={dayOfWeek}
                onChange={(e) => {
                  setDayOfWeek(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
                aria-label="Day of week field - enter 0-6 or * for every day, 0=Sunday"
              />
            </div>
          </div>
        </section>

        {/* Preset Schedules */}
        <section className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="preset-heading">
          <h2 id="preset-heading" className="text-lg font-semibold text-gray-800 mb-4">Preset Schedules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="group" aria-label="Preset schedule buttons">
            {presetSchedules.map((preset) => (
              <button
                key={preset.value}
                onClick={() => loadPreset(preset.value)}
                aria-label={`Load preset: ${preset.label}`}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Human Readable */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="readable-heading">
            <h2 id="readable-heading" className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
              Human Readable
            </h2>
            <p className="text-gray-700 leading-relaxed" role="status" aria-live="polite">
              {getHumanReadable(cronExpression)}
            </p>
          </section>

          {/* Next Run Times */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="runtimes-heading">
            <h2 id="runtimes-heading" className="text-lg font-semibold text-gray-800 mb-4">Next Run Times</h2>
            <ul className="space-y-2" role="list" aria-label="Next scheduled run times">
              {getNextRunTimes(cronExpression).map((time, index) => (
                <li key={index} className="text-sm text-gray-700" role="listitem">
                  {index + 1}. {time}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <InfoSection 
          title="Cron Expression Format"
          items={[
            {
              label: "Format",
              description: "minute hour day month day-of-week"
            },
            {
              label: "Special Characters",
              description: "* (any), */n (every n), n,m (specific values), n-m (range)"
            },
            {
              label: "Examples",
              description: "0 0 * * * (daily at midnight), */15 * * * * (every 15 minutes)"
            },
            {
              label: "Day of Week",
              description: "0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday"
            }
          ]}
          useCases="scheduled tasks, automation, CI/CD pipelines, backup scheduling, task runners"
        />
      </div>
    </div>
  );
};

export default CronExpressionBuilder;
