import { describe, expect, it } from 'vitest';
import { isFinalStatus, statusLabel } from './tracking';

describe('tracking labels', () => {
  it('gives customers a readable label', () => {
    expect(statusLabel('HANDED_TO_CARRIER')).toBe('With the carrier');
  });

  it('treats delivered, returned and failed as final', () => {
    expect(isFinalStatus('DELIVERED')).toBe(true);
    expect(isFinalStatus('RETURNED')).toBe(true);
    expect(isFinalStatus('IN_TRANSIT')).toBe(false);
  });
});
