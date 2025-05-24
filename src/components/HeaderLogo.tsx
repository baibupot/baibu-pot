
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-3 min-w-0 flex-shrink-0">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm sm:text-lg">PÖT</span>
      </div>
      <div className="hidden xs:block min-w-0">
        <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
          BAİBÜ PÖT
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
          Psikoloji Öğrencileri Topluluğu
        </p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
