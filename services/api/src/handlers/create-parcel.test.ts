import type { Parcel } from '@parcelhub/shared-types';
import { describe, expect, it } from 'vitest';
import { handler } from './create-parcel';
import { handler as health } from './health';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

const parseBody = <T>(res: { body?: string }) => JSON.parse(res.body ?? '') as T;

const booking = {
  journey: 'COLLECTION',
  size: 'S',
  senderPostcode: 'E17 5EG',
  recipientPostcode: 'M1 1AE',
  collectionDate: '2026-12-01',
};

const request = (body: string | undefined, isBase64Encoded = false) => ({ body, isBase64Encoded });

describe('POST /v1/parcels', () => {
  it('creates a booked parcel', async () => {
    const res = await handler(request(JSON.stringify(booking)));

    expect(res.statusCode).toBe(201);
    const parcel = parseBody<Parcel>(res);
    expect(parcel).toMatchObject({ status: 'BOOKED', booking });
    expect(parcel.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('accepts base64-encoded bodies', async () => {
    const res = await handler(request(Buffer.from(JSON.stringify(booking)).toString('base64'), true));
    expect(res.statusCode).toBe(201);
  });

  it('rejects malformed JSON', async () => {
    const res = await handler(request('{not json'));
    expect(res.statusCode).toBe(400);
    expect(parseBody<ErrorBody>(res).error.code).toBe('INVALID_JSON');
  });

  it('returns field errors for an invalid booking', async () => {
    const res = await handler(request(JSON.stringify({ ...booking, senderPostcode: 'nope' })));
    expect(res.statusCode).toBe(400);
    expect(parseBody<ErrorBody>(res).error.details).toEqual({ senderPostcode: 'Enter a valid UK postcode' });
  });
});

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await health();
    expect(res.statusCode).toBe(200);
  });
});
