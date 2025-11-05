import React from 'react';

interface InfoItem {
  label: string;
  description: string;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
  useCases?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, items, useCases }) => {
  return (
    <section className="mt-6 bg-blue-50 rounded-lg p-4" aria-labelledby="info-section-title">
      <h2 id="info-section-title" className="font-semibold text-blue-900 mb-2">{title}</h2>
      <dl className="text-sm text-blue-800 space-y-1">
        {items.map((item, index) => (
          <div key={index}>
            <dt className="inline font-bold">{item.label}:</dt>
            {' '}
            <dd className="inline">{item.description}</dd>
          </div>
        ))}
        {useCases && (
          <div>
            <dt className="inline font-bold">Use cases:</dt>
            {' '}
            <dd className="inline">{useCases}</dd>
          </div>
        )}
      </dl>
    </section>
  );
};

export default InfoSection;