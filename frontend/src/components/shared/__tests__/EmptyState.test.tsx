import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="Nothing here" description="Check back later." />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Check back later.')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    const { container } = render(<EmptyState icon={Bell} title="No notifications" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders an action button and fires onAction when clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState title="No drafts" actionLabel="Write one" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Write one' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render a button when no action is provided', () => {
    render(<EmptyState title="No drafts" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
