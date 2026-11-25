export type ParcelSize = 'S' | 'M' | 'L';

export type Journey = 'DROP_OFF' | 'COLLECTION';

export type ParcelStatus =
  | 'BOOKED'
  | 'DROPPED_OFF'
  | 'COLLECTED'
  | 'HANDED_TO_CARRIER'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RECLAIM_REQUESTED'
  | 'RETURNED'
  | 'FAILED';

interface BookingBase {
  size: ParcelSize;
  senderPostcode: string;
  recipientPostcode: string;
}

/** Customer takes the parcel to a shop or locker. */
export interface DropOffBooking extends BookingBase {
  journey: 'DROP_OFF';
  dropOffPointId: string;
}

/** A courier collects the parcel from the customer's address. */
export interface CollectionBooking extends BookingBase {
  journey: 'COLLECTION';
  /** ISO date, e.g. 2026-12-01 */
  collectionDate: string;
}

export type Booking = DropOffBooking | CollectionBooking;

export interface Parcel {
  id: string;
  status: ParcelStatus;
  booking: Booking;
  createdAt: string;
}

export interface TrackingEvent {
  eventId: string;
  parcelId: string;
  status: ParcelStatus;
  carrier: string;
  occurredAt: string;
}

export const PARCEL_SIZES: readonly ParcelSize[] = ['S', 'M', 'L'];

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidUkPostcode(value: string): boolean {
  return UK_POSTCODE.test(value.trim());
}

/** "e175eg" -> "E17 5EG" */
export function normalisePostcode(value: string): string {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export type FieldErrors = Partial<Record<string, string>>;

export type BookingValidation =
  | { ok: true; value: Booking }
  | { ok: false; errors: FieldErrors };

/**
 * Validates untrusted input (a form submission or an API request body).
 * Shared by the web app and the API so both enforce the same rules.
 */
export function validateBooking(input: unknown): BookingValidation {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { body: 'Booking must be an object' } };
  }
  const raw = input as Record<string, unknown>;
  const errors: FieldErrors = {};

  if (raw.journey !== 'DROP_OFF' && raw.journey !== 'COLLECTION') {
    errors.journey = 'Choose drop-off or collection';
  }
  if (!PARCEL_SIZES.includes(raw.size as ParcelSize)) {
    errors.size = 'Choose a parcel size';
  }
  for (const field of ['senderPostcode', 'recipientPostcode'] as const) {
    const value = raw[field];
    if (typeof value !== 'string' || !isValidUkPostcode(value)) {
      errors[field] = 'Enter a valid UK postcode';
    }
  }
  if (raw.journey === 'DROP_OFF' && (typeof raw.dropOffPointId !== 'string' || raw.dropOffPointId === '')) {
    errors.dropOffPointId = 'Choose a drop-off point';
  }
  if (raw.journey === 'COLLECTION' && (typeof raw.collectionDate !== 'string' || !ISO_DATE.test(raw.collectionDate))) {
    errors.collectionDate = 'Choose a collection date';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const base: BookingBase = {
    size: raw.size as ParcelSize,
    senderPostcode: normalisePostcode(raw.senderPostcode as string),
    recipientPostcode: normalisePostcode(raw.recipientPostcode as string),
  };
  const value: Booking =
    raw.journey === 'DROP_OFF'
      ? { ...base, journey: 'DROP_OFF', dropOffPointId: raw.dropOffPointId as string }
      : { ...base, journey: 'COLLECTION', collectionDate: raw.collectionDate as string };
  return { ok: true, value };
}
