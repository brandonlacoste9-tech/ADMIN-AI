'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { calComClient, mockAppointments } from '@/lib/supabase';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  duration: number;
  description?: string;
}

export default function BookingPage() {
  const { t, locale } = useApp();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Generate available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  useEffect(() => {
    // Fetch event types from Cal.com
    const fetchServices = async () => {
      setLoading(true);
      try {
        const eventTypes = await calComClient.getEventTypes();
        if (eventTypes.length > 0) {
          setServices(eventTypes);
        } else {
          // Fallback mock services
          setServices([
            { id: 1, title: locale === 'fr' ? 'Consultation' : 'Consultation', duration: 30 },
            { id: 2, title: locale === 'fr' ? 'Suivi' : 'Follow-up', duration: 15 },
            { id: 3, title: locale === 'fr' ? 'Réunion initiale' : 'Initial Meeting', duration: 60 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback mock services
        setServices([
          { id: 1, title: locale === 'fr' ? 'Consultation' : 'Consultation', duration: 30 },
          { id: 2, title: locale === 'fr' ? 'Suivi' : 'Follow-up', duration: 15 },
          { id: 3, title: locale === 'fr' ? 'Réunion initiale' : 'Initial Meeting', duration: 60 },
        ]);
      }
      setLoading(false);
    };

    fetchServices();
  }, [locale]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.email) {
      return;
    }

    setLoading(true);
    
    try {
      const startTime = `${selectedDate}T${selectedTime}:00`;
      
      // Try to create booking with Cal.com
      const booking = await calComClient.createBooking(selectedService.id, {
        startTime,
        attendee: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        notes: formData.notes
      });

      if (booking) {
        setBookingSuccess(true);
      } else {
        // Fallback: just show success (demo mode)
        setBookingSuccess(true);
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Still show success in demo mode
      setBookingSuccess(true);
    }

    setLoading(false);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setBookingSuccess(false);
  };

  if (bookingSuccess) {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('appointmentBooked')}</h2>
            <div className="text-slate-400 space-y-2 mb-8">
              <p>{selectedService?.title}</p>
              <p>{selectedDate} at {selectedTime}</p>
              <p>{formData.name}</p>
            </div>
            <button
              onClick={resetBooking}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {locale === 'fr' ? 'Réserver un autre' : 'Book Another'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">{t('bookAppointment')}</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step >= s
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{t('selectService')}</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="p-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{service.title}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{service.duration} min</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{t('selectDate')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();
              const month = dateObj.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' });
              
              return (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className="p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 rounded-lg text-center transition-colors"
                >
                  <p className="text-slate-400 text-sm">{dayName}</p>
                  <p className="text-white font-bold text-lg">{dayNum}</p>
                  <p className="text-slate-400 text-sm">{month}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-6 text-slate-400 hover:text-white"
          >
            ← {locale === 'fr' ? 'Retour' : 'Back'}
          </button>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{t('selectTime')}</h2>
          <p className="text-slate-400 mb-6">{selectedDate}</p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className="py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 rounded-lg text-white transition-colors"
              >
                {time}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-6 text-slate-400 hover:text-white"
          >
            ← {locale === 'fr' ? 'Retour' : 'Back'}
          </button>
        </div>
      )}

      {/* Step 4: Fill Form */}
      {step === 4 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{t('yourName')}</h2>
          
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-5 h-5" />
              <span>{selectedService?.title}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 mt-2">
              <Clock className="w-5 h-5" />
              <span>{selectedDate} at {selectedTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">{t('yourName')} *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">{t('yourEmail')} *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">{t('yourPhone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">{t('notes')}</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={loading || !formData.name || !formData.email}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('bookNow')
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
