import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StateBadge } from './StateBadge';

describe('StateBadge', () => {
  it('renders the human-readable state label', () => {
    render(<StateBadge state="passed" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('shows the raw state as a tooltip title', () => {
    render(<StateBadge state="errored" />);
    expect(screen.getByTitle('Failed')).toBeInTheDocument();
  });

  it('folds a failure count into the same label', () => {
    render(<StateBadge state="errored" count={21} />);
    expect(screen.getByText('Failed · 21')).toBeInTheDocument();
    expect(screen.getByTitle('Failed — 21 failures reported')).toBeInTheDocument();
  });
});
