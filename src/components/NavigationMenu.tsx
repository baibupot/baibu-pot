
import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationItem {
  name: string;
  href: string;
}

interface NavigationMenuProps {
  items: NavigationItem[];
  moreItems: NavigationItem[];
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ items, moreItems }) => {
  return (
    <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
      {items.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200 whitespace-nowrap"
        >
          {item.name}
        </Link>
      ))}
      <div className="relative group">
        <button className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200">
          Daha Fazla
        </button>
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {moreItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
