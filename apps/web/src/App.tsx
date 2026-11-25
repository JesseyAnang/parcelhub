import { useState } from 'react';
import type { Booking } from '@parcelhub/shared-types';
import { BookingForm } from './components/BookingForm';

export function App() {
  const [booking, setBooking] = useState<Booking | null>(null);

  return (
    <main>
      <h1>ParcelHub</h1>
      {booking ? (
        <section aria-label="Booking confirmation">
          <h2>Booking received</h2>
          <p>
            {booking.journey === 'DROP_OFF'
              ? `Drop off your ${booking.size} parcel at ${booking.dropOffPointId}.`
              : `We'll collect your ${booking.size} parcel from ${booking.senderPostcode} on ${booking.collectionDate}.`}
          </p>
          <button type="button" onClick={() => setBooking(null)}>
            Book another parcel
          </button>
        </section>
      ) : (
        // Week 2: replace with a call to POST /v1/parcels.
        <BookingForm onSubmit={setBooking} />
      )}
    </main>
  );
}
