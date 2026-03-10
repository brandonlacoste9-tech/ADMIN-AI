'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { mockAppointments, mockCustomers } from '@/lib/supabase';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useApp();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    // Calculate today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(apt => apt.date === today);
    setTodayCount(todayAppts.length);
  }, [appointments]);

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">{t('dashboard')}</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t('todayAppointments')} 
          value={todayCount} 
          icon={Calendar}
          color="bg-blue-600"
        />
        <StatCard 
          title={t('totalCustomers')} 
          value={mockCustomers.length} 
          icon={Users}
          color="bg-green-600"
        />
        <StatCard 
          title={t('upcomingAppointments')} 
          value={upcomingAppointments.length} 
          icon={Clock}
          color="bg-purple-600"
        />
        <StatCard 
          title={t('recentActivity')} 
          value="12" 
          icon={CheckCircle}
          color="bg-orange-600"
        />
      </div>

      {/* Appointments List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">{t('upcomingAppointments')}</h2>
        </div>
        
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">{t('noAppointments')}</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{apt.customerName}</p>
                      <p className="text-slate-400 text-sm">{apt.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{apt.date}</p>
                    <p className="text-slate-400 text-sm">{apt.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
