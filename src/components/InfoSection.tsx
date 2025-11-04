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
    <div className="mt-6 bg-blue-50 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
      <div className="text-sm text-blue-800 space-y-1">
        {items.map((item, index) => (
          <p key={index}>
            <strong>{item.label}:</strong> {item.description}
          </p>
        ))}
        {useCases && (
          <p><strong>Use cases:</strong> {useCases}</p>
        )}
      </div>
    </div>
  );
};

export default InfoSection;