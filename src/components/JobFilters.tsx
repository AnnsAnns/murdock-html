import type { KeyboardEvent } from 'react';
import { JOB_TYPES } from '../api/query';
import box from '../styles/box.module.css';
import controls from '../styles/controls.module.css';
import filters from './JobFilters.module.css';
import { STATES, stateIcon, stateLabel } from '../utils/state';
import { Icon } from './Icon';
import type { DraftParams, JobState, JobType, QueryParams } from '../types';

const TYPE_LABELS: Record<JobType, string> = { all: 'All', pr: 'PRs', branch: 'Branches', tag: 'Tags' };

export interface JobFiltersProps {
  params: QueryParams;
  draft: DraftParams;
  onType: (type: JobType) => void;
  onToggleState: (state: JobState) => void;
  onTogglePrState: (key: 'open' | 'closed') => void;
  onDraftChange: (field: keyof DraftParams, value: string) => void;
  onCommit: () => void;
}

/** Dashboard filter panel. Text fields are drafted locally and committed on
 *  Enter or the Search button so typing doesn't spam the URL. */
export function JobFilters({
  params,
  draft,
  onType,
  onToggleState,
  onTogglePrState,
  onDraftChange,
  onCommit,
}: JobFiltersProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onCommit();
  };

  const inputClass = `${controls.input} ${filters.filterInput}`;

  return (
    <section className={`${box.box} ${filters.filterPanel}`}>
      <div className={box.boxTitle}>
        <Icon name="search" size={14} />
        <span className={box.titleLabel}>Filters</span>
      </div>

      <div className={`${box.boxBody} ${filters.filterBody}`}>
        <div className={filters.filterBar}>
          <div className={filters.filterGroup}>
            <span className={filters.filterLabel}>Type</span>
            <div className={filters.segmented} role="group" aria-label="Job type">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={params.type === type ? filters.isOn : ''}
                  aria-pressed={params.type === type}
                  onClick={() => onType(type)}
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className={filters.filterGroup}>
            <span className={filters.filterLabel}>States</span>
            <div className={filters.toolbarGroup} role="group" aria-label="Job states">
              {STATES.map((state) => {
                const on = params.states.includes(state);
                return (
                  <button
                    key={state}
                    type="button"
                    className={`${filters.toggle} ${on ? filters.isOn : ''}`}
                    data-state={state}
                    aria-pressed={on}
                    title={`${on ? 'Hide' : 'Show'} ${stateLabel(state).toLowerCase()} jobs`}
                    onClick={() => onToggleState(state)}
                  >
                    <Icon name={stateIcon(state)} />
                    <span>{stateLabel(state)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={controls.inputGroup}>
            <span className={controls.inputGroupAddon}>
              <Icon name="tag" />
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="Commit SHA"
              aria-label="Commit SHA"
              value={draft.sha}
              onChange={(event) => onDraftChange('sha', event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          <div className={controls.inputGroup}>
            <span className={controls.inputGroupAddon}>
              <Icon name="person" />
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="Commit author"
              aria-label="Commit author"
              value={draft.author}
              onChange={(event) => onDraftChange('author', event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          {params.type === 'pr' && (
            <>
              <div className={controls.inputGroup}>
                <span className={controls.inputGroupAddon}>PR #</span>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="PR number"
                  aria-label="PR number"
                  value={draft.prnum}
                  onChange={(event) => onDraftChange('prnum', event.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div className={filters.toolbarGroup} role="group" aria-label="PR state">
                <button
                  type="button"
                  className={`${filters.toggle} ${params.prstates.open ? filters.isOn : ''}`}
                  aria-pressed={params.prstates.open}
                  onClick={() => onTogglePrState('open')}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={`${filters.toggle} ${params.prstates.closed ? filters.isOn : ''}`}
                  aria-pressed={params.prstates.closed}
                  onClick={() => onTogglePrState('closed')}
                >
                  Closed
                </button>
              </div>
            </>
          )}

          {params.type === 'branch' && (
            <div className={controls.inputGroup}>
              <span className={controls.inputGroupAddon}>Branch</span>
              <input
                className={inputClass}
                type="text"
                placeholder="Branch name"
                aria-label="Branch name"
                value={draft.branch}
                onChange={(event) => onDraftChange('branch', event.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          {params.type === 'tag' && (
            <div className={controls.inputGroup}>
              <span className={controls.inputGroupAddon}>Tag</span>
              <input
                className={inputClass}
                type="text"
                placeholder="Tag name"
                aria-label="Tag name"
                value={draft.tag}
                onChange={(event) => onDraftChange('tag', event.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          <button
            type="button"
            className={`${controls.btn} ${filters.filterSearch}`}
            onClick={onCommit}
          >
            <Icon name="search" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </section>
  );
}
