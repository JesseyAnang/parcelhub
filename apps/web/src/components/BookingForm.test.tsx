import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingForm } from './BookingForm';

describe('BookingForm', () => {
  it('submits a valid drop-off booking', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText('Parcel size'), 'M');
    await user.type(screen.getByLabelText('Your postcode'), 'e175eg');
    await user.type(screen.getByLabelText('Recipient postcode'), 'SW1A 1AA');
    await user.selectOptions(screen.getByLabelText('Drop-off point'), 'shop-walthamstow');
    await user.click(screen.getByRole('button', { name: 'Book parcel' }));

    expect(onSubmit).toHaveBeenCalledWith({
      journey: 'DROP_OFF',
      size: 'M',
      senderPostcode: 'E17 5EG',
      recipientPostcode: 'SW1A 1AA',
      dropOffPointId: 'shop-walthamstow',
    });
  });

  it('asks for a collection date instead of a drop-off point for collections', async () => {
    const user = userEvent.setup();
    render(<BookingForm onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText('Collect it from me'));

    expect(screen.getByLabelText('Collection date')).toBeInTheDocument();
    expect(screen.queryByLabelText('Drop-off point')).not.toBeInTheDocument();
  });

  it('shows errors and does not submit an invalid booking', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Your postcode'), 'not a postcode');
    await user.click(screen.getByRole('button', { name: 'Book parcel' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').map((el) => el.textContent)).toContain('Enter a valid UK postcode');
  });
});
