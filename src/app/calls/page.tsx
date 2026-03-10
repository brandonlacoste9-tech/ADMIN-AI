'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppContext';
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Search, Play, Clock } from 'lucide-react';

interface CallLog {
  id: string;
  callerName: string;
  callerNumber: string;
  direction: 'inbound' | 'outbound' | 'missed';
  duration: number;
  timestamp: string;
  status: 'completed' | 'voicemail' | 'no-answer';
  transcript?: string;
}

const mockCallLogs: CallLog[] = [
  {
    id: '1',
    callerName: 'John Smith',
    callerNumber: '+1 555-0101',
    direction: 'inbound',
    duration: 180,
    timestamp: '2024-03-10T09:15:00',
    status: 'completed',
    transcript: 'Hi, I wanted to schedule an appointment for next week...'
  },
  {
    id: '2',
    callerName: 'Marie Dubois',
    callerNumber: '+1 555-0102',
    direction: 'missed',
    duration: 0,
    timestamp: '2024-03-10T10:30:00',
    status: 'no-answer'
  },
  {
    id: '3',
    callerName: 'Carlos Rodriguez',
    callerNumber: '+1 555-0103',
    direction: 'outbound',
    duration: 300,
    timestamp: '2024-03-10T11:00:00',
    status: 'completed',
    transcript: 'Hello Carlos, this is regarding your appointment confirmation...'
  },
  {
    id: '4',
    callerName: 'Sophie Martin',
    callerNumber: '+1 555-0104',
    direction: 'inbound',
    duration: 45,
    timestamp: '2024-03-09T14:20:00',
    status: 'voicemail',
    transcript: 'Hi, please call me back when you get a chance. Thanks!'
  },
  {
    id: '5',
    callerName: 'Unknown',
    callerNumber: '+1 555-0199',
    direction: 'missed',
    duration: 0,
    timestamp: '2024-03-09T16:45:00',
    status: 'no-answer'
  },
];

export default function CallLogPage() {
  const { t, locale } = useApp();
  const [calls, setCalls] = useState<CallLog[]>(mockCallLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const filteredCalls = calls.filter(call =>
    call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.callerNumber.includes(searchQuery)
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCallIcon = (direction: CallLog['direction']) => {
    switch (direction) {
      case 'inbound':
        return <PhoneIncoming className="w-5 h-5 text-green-400" />;
      case 'outbound':
        return <PhoneOutgoing className="w-5 h-5 text-blue-400" />;
      case 'missed':
        return <PhoneMissed className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBadge = (status: CallLog['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">{locale === 'fr' ? 'Terminé' : 'Completed'}</span>;
      case 'voicemail':
        return <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">{locale === 'fr' ? 'Messagerie' : 'Voicemail'}</span>;
      case 'no-answer':
        return <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">{locale === 'fr' ? 'Sans réponse' : 'No Answer'}</span>;
    }
  };

  // Stats
  const totalCalls = calls.length;
  const missedCalls = calls.filter(c => c.direction === 'missed').length;
  const totalDuration = calls.reduce((acc, c) => acc + c.duration, 0);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">{locale === 'fr' ? 'Historique d\'appels' : 'Call History'}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Total appels' : 'Total Calls'}</p>
              <p className="text-2xl font-bold text-white">{totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <PhoneMissed className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Appels manqués' : 'Missed Calls'}</p>
              <p className="text-2xl font-bold text-white">{missedCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Durée totale' : 'Total Duration'}</p>
              <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Call List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{locale === 'fr' ? 'Aucun appel' : 'No calls'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className="p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                      {getCallIcon(call.direction)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{call.callerName}</p>
                      <p className="text-slate-400 text-sm">{call.callerNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{formatTimestamp(call.timestamp)}</p>
                    {call.duration > 0 && (
                      <p className="text-slate-500 text-sm">{formatDuration(call.duration)}</p>
                    )}
                  </div>
                  {getStatusBadge(call.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{locale === 'fr' ? 'Détails de l\'appel' : 'Call Details'}</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                  {getCallIcon(selectedCall.direction)}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedCall.callerName}</p>
                  <p className="text-slate-400">{selectedCall.callerNumber}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedCall.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Date/Heure' : 'Date/Time'}</p>
                  <p className="text-white">{formatTimestamp(selectedCall.timestamp)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Durée' : 'Duration'}</p>
                  <p className="text-white">{formatDuration(selectedCall.duration)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Direction' : 'Direction'}</p>
                  <p className="text-white capitalize">{selectedCall.direction}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{locale === 'fr' ? 'Statut' : 'Status'}</p>
                  <p className="text-white capitalize">{selectedCall.status}</p>
                </div>
              </div>

              {selectedCall.transcript && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">{locale === 'fr' ? 'Transcription' : 'Transcript'}</p>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-300">{selectedCall.transcript}</p>
                  </div>
                </div>
              )}

              <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Play className="w-5 h-5" />
                {locale === 'fr' ? 'Écouter l\'enregistrement' : 'Play Recording'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
