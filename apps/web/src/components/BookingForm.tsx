import { useState, type FormEvent } from 'react';
import { validateBooking, type Booking, type FieldErrors, type Journey } from '@parcelhub/shared-types';

interface BookingFormProps {
  onSubmit: (booking: Booking) => void;
}

const DROP_OFF_POINTS = [
  { id: 'shop-walthamstow', label: 'Walthamstow Central News' },
  { id: 'locker-stratford', label: 'Stratford Westfield Locker' },
];

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [journey, setJourney] = useState<Journey>('DROP_OFF');
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const result = validateBooking({ ...fields, journey });
    if (result.ok) {
      setErrors({});
      onSubmit(result.value);
    } else {
      setErrors(result.errors);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Book a parcel">
      <fieldset>
        <legend>How should we get your parcel?</legend>
        <label>
          <input
            type="radio"
            name="journeyChoice"
            checked={journey === 'DROP_OFF'}
            onChange={() => setJourney('DROP_OFF')}
          />
          I'll drop it off
        </label>
        <label>
          <input
            type="radio"
            name="journeyChoice"
            checked={journey === 'COLLECTION'}
            onChange={() => setJourney('COLLECTION')}
          />
          Collect it from me
        </label>
      </fieldset>

      <label>
        Parcel size
        <select name="size" defaultValue="">
          <option value="" disabled>
            Choose a size
          </option>
          <option value="S">Small (up to 2kg)</option>
          <option value="M">Medium (up to 10kg)</option>
          <option value="L">Large (up to 20kg)</option>
        </select>
      </label>
      <FieldError message={errors.size} />

      <label>
        Your postcode
        <input name="senderPostcode" autoComplete="postal-code" />
      </label>
      <FieldError message={errors.senderPostcode} />

      <label>
        Recipient postcode
        <input name="recipientPostcode" />
      </label>
      <FieldError message={errors.recipientPostcode} />

      {journey === 'DROP_OFF' ? (
        <>
          <label>
            Drop-off point
            <select name="dropOffPointId" defaultValue="">
              <option value="" disabled>
                Choose a drop-off point
              </option>
              {DROP_OFF_POINTS.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.label}
                </option>
              ))}
            </select>
          </label>
          <FieldError message={errors.dropOffPointId} />
        </>
      ) : (
        <>
          <label>
            Collection date
            <input type="date" name="collectionDate" />
          </label>
          <FieldError message={errors.collectionDate} />
        </>
      )}

      <button type="submit">Book parcel</button>
    </form>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <p role="alert">{message}</p> : null;
}
