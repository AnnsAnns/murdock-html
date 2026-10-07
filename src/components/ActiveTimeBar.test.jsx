import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ActiveTimeBar } from './ActiveTimeBar';

const job = (overrides = {}) => ({ uid: 'x', ...overrides });

function renderBar(jobs, now) {
  return render(
    <MemoryRouter>
      <ActiveTimeBar jobs={jobs} now={now} />
    </MemoryRouter>,
  );
}

describe('ActiveTimeBar', () => {
  it('shows active, idle and expected totals', () => {
    renderBar(
      [
        job({ uid: 'a', state: 'passed', start_time: 800, runtime: 60 }),
        job({ uid: 'b', state: 'errored', start_time: 900, runtime: 100 }),
        job({
          uid: 'q',
          state: 'queued',
          env: { CI_PULL_LABELS: 'CI: skip compile test' },
        }),
      ],
      1_000_000,
    );

    // 60s + 100s active, 40s idle gap, 180s expected -> 160/200 = 80%.
    expect(screen.getByText('02m 40s')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === '40s idle')).toBeInTheDocument();
    expect(screen.getByText('80% utilized')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === '+03m 00s expected')).toBeInTheDocument();
  });

  it('links each job segment to its detail page', () => {
    renderBar([job({ uid: 'a', state: 'passed', start_time: 800, runtime: 60 })], 1_000_000);

    expect(screen.getByRole('link', { name: 'Success · 01m 00s' })).toHaveAttribute(
      'href',
      '/details/a',
    );
  });

  it('renders nothing without any job', () => {
    const { container } = renderBar([], 0);
    expect(container).toBeEmptyDOMElement();
  });
});
