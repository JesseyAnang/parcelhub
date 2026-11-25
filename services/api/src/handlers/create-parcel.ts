import { randomUUID } from 'node:crypto';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { validateBooking, type Parcel } from '@parcelhub/shared-types';
import { json, parseJsonBody, problem } from '../http';

/**
 * POST /v1/parcels
 * Week 3: persist to DynamoDB and record the fee in Aurora.
 * Week 4: honour the Idempotency-Key header.
 */
export const handler = async (event: Pick<APIGatewayProxyEventV2, 'body' | 'isBase64Encoded'>) => {
  const body = parseJsonBody(event);
  if (!body.ok) {
    return problem(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const result = validateBooking(body.value);
  if (!result.ok) {
    return problem(400, 'VALIDATION_FAILED', 'Booking is invalid', result.errors);
  }

  const parcel: Parcel = {
    id: randomUUID(),
    status: 'BOOKED',
    booking: result.value,
    createdAt: new Date().toISOString(),
  };
  return json(201, parcel);
};
