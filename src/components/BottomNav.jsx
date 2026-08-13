import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Info, User, Search } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/useAuthStore';

export function BottomNav() {
  const { token } = useAuthStore();
  const location = useLocation();

  const tabs = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Categories', icon: Grid, path: '/category/all' },
    { name: 'Shop', icon: Search, path: '/search' },
    { name: 'About Us', icon: Info, path: '/about' },
    { name: 'Profile', icon: User, path: token ? '/dashboard' : '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white backdrop-blur-lg border-t border-brand-red/10 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.2)] pb-safe z-50 transition-all">
      <div className="flex justify-around items-center h-[72px] px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.name === 'Search'
            ? location.pathname === '/search'
            : tab.name === 'Categories'
              ? location.pathname.startsWith('/category')
              : tab.name === 'Profile'
                ? location.pathname === '/profile' || location.pathname === '/dashboard' || location.pathname === '/my-addresses'
                : location.pathname === tab.path || (tab.name === 'About Us' && location.pathname.startsWith('/about'));

          return (
            <NavLink key={tab.name} to={tab.path}
              onClick={() => {}}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 relative',
                isActive ? 'text-brand-red -translate-y-1' : 'text-gray-400 hover:text-gray-900'
              )}>
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300",
                isActive ? "text-brand-red" : "bg-transparent"
              )}>
                <Icon className={cn('w-5 h-5 transition-transform duration-300', isActive ? 'scale-110' : '')} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-all duration-300",
                isActive ? "opacity-100" : "opacity-80"
              )}>{tab.name}</span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-brand-red text-gray-900 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
