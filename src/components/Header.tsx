import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-white hover:text-blue-200 transition-colors duration-200"
          >
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Helpful</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;