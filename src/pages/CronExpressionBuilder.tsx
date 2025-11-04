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

    const [min, hr] = parts;
    const now = new Date();
    const times: string[] = [];
    
    const minuteVal = min === '*' ? 0 : parseInt(min);
    const hourVal = hr === '*' ? 0 : parseInt(hr);

    for (let i = 0; i < count; i++) {
      const next = new Date(now);
      next.setDate(now.getDate() + i);
      next.setHours(hourVal, minuteVal, 0, 0);
      
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      times.push(next.toLocaleString());
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
        <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cron Expression
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => handleCronExpressionChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0 0 * * *"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minute (0-59)
              </label>
              <input
                type="text"
                value={minute}
                onChange={(e) => {
                  setMinute(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hour (0-23)
              </label>
              <input
                type="text"
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day (1-31)
              </label>
              <input
                type="text"
                value={dayOfMonth}
                onChange={(e) => {
                  setDayOfMonth(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month (1-12)
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week (0-6)
              </label>
              <input
                type="text"
                value={dayOfWeek}
                onChange={(e) => {
                  setDayOfWeek(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="*"
              />
            </div>
          </div>
        </div>

        {/* Preset Schedules */}
        <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preset Schedules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presetSchedules.map((preset) => (
              <button
                key={preset.value}
                onClick={() => loadPreset(preset.value)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Human Readable */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Human Readable
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {getHumanReadable(cronExpression)}
            </p>
          </div>

          {/* Next Run Times */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Run Times</h3>
            <ul className="space-y-2">
              {getNextRunTimes(cronExpression).map((time, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {index + 1}. {time}
                </li>
              ))}
            </ul>
          </div>
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
