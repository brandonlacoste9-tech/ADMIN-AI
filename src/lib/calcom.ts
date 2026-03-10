const CAL_COM_API_KEY = process.env.CAL_COM_API_KEY || 'cal_live_3bb903adf86ba8b333fec5ebcca56846';
const CAL_COM_BASE_URL = 'https://api.cal.com/v1';

export interface CalBooking {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees?: Array<{
    email: string;
    name: string;
  }>;
}

export interface CalEventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  duration: number;
}

class CalComClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || CAL_COM_API_KEY;
    this.baseUrl = CAL_COM_BASE_URL;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`Cal.com API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get event types
  async getEventTypes(): Promise<CalEventType[]> {
    try {
      const data = await this.fetch<{ eventTypes: CalEventType[] }>('/event-types?enabled=true');
      return data.eventTypes || [];
    } catch (error) {
      console.error('Error fetching event types:', error);
      return [];
    }
  }

  // Get bookings
  async getBookings(): Promise<CalBooking[]> {
    try {
      const data = await this.fetch<{ bookings: CalBooking[] }>('/bookings');
      return data.bookings || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  // Create a booking
  async createBooking(eventTypeId: number, bookingData: {
    startTime: string;
    attendee: {
      name: string;
      email: string;
      phone?: string;
    };
    notes?: string;
  }): Promise<CalBooking | null> {
    try {
      const data = await this.fetch<{ booking: CalBooking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventTypeId,
          startTime: bookingData.startTime,
          attendee: bookingData.attendee,
          notes: bookingData.notes,
        }),
      });
      return data.booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: number): Promise<boolean> {
    try {
      await this.fetch(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error('Error canceling booking:', error);
      return false;
    }
  }
}

export const calComClient = new CalComClient();
