import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/components/shared/FormField';
import { Input } from '@/components/ui/input';

describe('FormField', () => {
  it('renders the label and associates it with the field via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>
    );
    const label = screen.getByText('Email');
    expect(label.getAttribute('for')).toBe('email');
  });

  it('shows an error message when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Email is required">
        <Input id="email" />
      </FormField>
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('does not render an error message when none is provided', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>
    );
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });
});
