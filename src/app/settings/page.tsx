'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { Settings, Key, Globe, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { t, locale, setLocale } = useApp();
  const [settings, setSettings] = useState({
    calComApiKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    elevenLabsApiKey: ''
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('apiSettings', JSON.stringify(settings));
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    setLocale(lang);
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">{t('settings')}</h1>

      {/* Success/Error Messages */}
      {saved && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          {t('settingsSaved')}
        </div>
      )}
      
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* API Settings */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{t('apiSettings')}</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 mb-2">{t('calComApiKey')}</label>
            <input
              type="password"
              value={settings.calComApiKey}
              onChange={(e) => setSettings({ ...settings, calComApiKey: e.target.value })}
              placeholder="cal_live_..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2">{t('elevenLabsApiKey') || 'ElevenLabs API Key'}</label>
            <input
              type="password"
              value={settings.elevenLabsApiKey}
              onChange={(e) => setSettings({ ...settings, elevenLabsApiKey: e.target.value })}
              placeholder="sk_..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2">{t('supabaseUrl')}</label>
            <input
              type="url"
              value={settings.supabaseUrl}
              onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2">{t('supabaseAnonKey')}</label>
            <input
              type="password"
              value={settings.supabaseAnonKey}
              onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
              placeholder="eyJ..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mt-4"
          >
            {t('save')}
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{t('languageSettings')}</h2>
          </div>
        </div>
        
        <div className="p-6">
          <label className="block text-slate-400 mb-4">{t('selectLanguage')}</label>
          <div className="flex gap-4">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-4 px-6 rounded-lg border transition-colors ${
                locale === 'en'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-lg font-medium">{t('english')}</span>
              <span className="block text-sm opacity-70">🇺🇸</span>
            </button>
            
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`flex-1 py-4 px-6 rounded-lg border transition-colors ${
                locale === 'fr'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-lg font-medium">{t('french')}</span>
              <span className="block text-sm opacity-70">🇫🇷</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
