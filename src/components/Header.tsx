import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-white hover:text-blue-200 transition-colors duration-200"
          >
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Helpful</span>
          </Link>
          
          {/* Feedback Buttons Group */}
          <div className="flex items-center space-x-3">
            <feedback-elf-button type="review" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
            <feedback-elf-button type="bug" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
            <feedback-elf-button type="feature" api_key="00062f05-00062f1e-4c2f-856e-aef968a7fcd6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;