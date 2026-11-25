import { describe, expect, it } from 'vitest';
import { isValidUkPostcode, normalisePostcode, validateBooking } from './index';

describe('postcodes', () => {
  it.each(['E17 5EG', 'e175eg', 'SW1A 1AA', 'M1 1AE'])('accepts %s', (postcode) => {
    expect(isValidUkPostcode(postcode)).toBe(true);
  });

  it.each(['', '12345', 'E17', 'NOTAPOSTCODE'])('rejects "%s"', (postcode) => {
    expect(isValidUkPostcode(postcode)).toBe(false);
  });

  it('normalises spacing and case', () => {
    expect(normalisePostcode(' e17  5eg ')).toBe('E17 5EG');
  });
});

describe('validateBooking', () => {
  const dropOff = {
    journey: 'DROP_OFF',
    size: 'M',
    senderPostcode: 'e175eg',
    recipientPostcode: 'SW1A 1AA',
    dropOffPointId: 'shop-001',
  };

  it('returns a typed drop-off booking with normalised postcodes', () => {
    expect(validateBooking(dropOff)).toEqual({
      ok: true,
      value: { ...dropOff, senderPostcode: 'E17 5EG' },
    });
  });

  it('requires a collection date for collection journeys', () => {
    const result = validateBooking({ ...dropOff, journey: 'COLLECTION' });
    expect(result).toEqual({ ok: false, errors: { collectionDate: 'Choose a collection date' } });
  });

  it('drops fields that do not belong to the journey', () => {
    const result = validateBooking({ ...dropOff, journey: 'COLLECTION', collectionDate: '2026-12-01' });
    expect(result.ok && result.value).not.toHaveProperty('dropOffPointId');
  });

  it('reports every invalid field at once', () => {
    const result = validateBooking({ journey: 'TELEPORT', size: 'XL' });
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual([
      'journey',
      'recipientPostcode',
      'senderPostcode',
      'size',
    ]);
  });

  it('rejects non-object input', () => {
    expect(validateBooking(null)).toEqual({ ok: false, errors: { body: 'Booking must be an object' } });
  });
});
