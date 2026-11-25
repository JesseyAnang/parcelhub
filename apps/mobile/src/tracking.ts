import type { ParcelStatus } from '@parcelhub/shared-types';

const LABELS: Record<ParcelStatus, string> = {
  BOOKED: 'Booked',
  DROPPED_OFF: 'Dropped off',
  COLLECTED: 'Collected by courier',
  HANDED_TO_CARRIER: 'With the carrier',
  IN_TRANSIT: 'On its way',
  DELIVERED: 'Delivered',
  RECLAIM_REQUESTED: 'Return requested',
  RETURNED: 'Returned to sender',
  FAILED: 'Problem with delivery',
};

/** Customer-facing label for a tracking status. Typed as a Record so a new status fails the build until it has a label. */
export function statusLabel(status: ParcelStatus): string {
  return LABELS[status];
}

export function isFinalStatus(status: ParcelStatus): boolean {
  return status === 'DELIVERED' || status === 'RETURNED' || status === 'FAILED';
}
