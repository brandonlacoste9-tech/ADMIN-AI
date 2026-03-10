'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Globe,
  Phone
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/customers', labelKey: 'customers', icon: Users },
  { href: '/calls', labelKey: 'callHistory', icon: Phone },
  { href: '/booking', labelKey: 'booking', icon: Calendar },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale, setIsAuthenticated } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    router.push('/');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'fr' : 'en');
  };

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">{t('appName')}</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{t(item.labelKey as any)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <Globe size={20} />
          <span>{locale === 'en' ? 'Français' : 'English'}</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
