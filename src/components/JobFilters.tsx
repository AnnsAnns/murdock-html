import { useState, type KeyboardEvent } from 'react';
import { JOB_TYPES, LABEL_OPTIONS, LIMIT_OPTIONS } from '../api/query';
import box from '../styles/box.module.css';
import controls from '../styles/controls.module.css';
import filters from './JobFilters.module.css';
import { STATES, stateIcon, stateLabel } from '../utils/state';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from './Icon';
import type { DraftParams, JobState, JobType, QueryParams } from '../types';

/** The default page size, which is applied without confirmation. */
const DEFAULT_LIMIT = LIMIT_OPTIONS[0];

const TYPE_LABELS: Record<JobType, string> = {
  all: 'All',
  pr: 'PRs',
  branch: 'Branches',
  'merge-queue': 'Merges',
  nightly: 'Nightlies',
  tag: 'Tags',
};

export interface JobFiltersProps {
  params: QueryParams;
  draft: DraftParams;
  onType: (type: JobType) => void;
  /** Toggle a state's inclusion in the query. */
  onToggleState: (state: JobState) => void;
  onSelectAllStates: () => void;
  /** Toggle an excluded PR state (`open` / `closed`). */
  onToggleHiddenPrState: (key: 'open' | 'closed') => void;
  /** Toggle a PR label (client-side, matches any selected label). */
  onToggleLabel: (label: string) => void;
  onClearLabels: () => void;
  onDraftChange: (field: keyof DraftParams, value: string) => void;
  onCommit: () => void;
  onLimit: (limit: number) => void;
  onReset: () => void;
}

/** Dashboard filter panel. Text fields are drafted locally and committed on
 *  Enter or the Search button so typing doesn't spam the URL. */
export function JobFilters({
  params,
  draft,
  onType,
  onToggleState,
  onSelectAllStates,
  onToggleHiddenPrState,
  onToggleLabel,
  onClearLabels,
  onDraftChange,
  onCommit,
  onLimit,
  onReset,
}: JobFiltersProps) {
  const [pendingLimit, setPendingLimit] = useState<number | null>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onCommit();
  };

  // Any size other than the default is confirmed first.
  const chooseLimit = (option: number) => {
    if (option === Number(params.limit)) return;
    if (option === DEFAULT_LIMIT) onLimit(option);
    else setPendingLimit(option);
  };

  const inputClass = `${controls.input} ${filters.filterInput}`;
  // States are selected positively: the query carries exactly the states shown,
  // and "All" simply selects every one of them.
  const allSelected = params.states.length === STATES.length;

  return (
    <section id="job-filters" className={box.box}>
      <div className={box.boxTitle}>
        <Icon name="filter" size={14} />
        <span className={box.titleLabel}>Filters</span>
      </div>

      <div className={`${box.boxBody} ${filters.filterBody}`}>
        <div className={filters.filterSection}>
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

        <div className={filters.filterSection}>
          <span className={filters.filterLabel}>Search</span>
          <div className={controls.inputGroup}>
            <span className={controls.inputGroupAddon}>
              <Icon name="search" />
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="Message, PR title or ref"
              aria-label="Search jobs"
              value={draft.search}
              onChange={(event) => onDraftChange('search', event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>

        <div className={filters.filterSection}>
          <div className={filters.sectionHead}>
            <span className={filters.filterLabel}>States</span>
            <span className={filters.stateSummary}>
              <span>
                {allSelected ? 'All shown' : `${params.states.length} of ${STATES.length} shown`}
              </span>
              {!allSelected && (
                <button
                  type="button"
                  className={filters.selectAll}
                  aria-label="Reset states"
                  title="Show every state again"
                  onClick={onSelectAllStates}
                >
                  Reset
                </button>
              )}
            </span>
          </div>
          <div className={filters.stateList} role="group" aria-label="Job states">
            {STATES.map((state) => {
              const selected = params.states.includes(state);
              return (
                <button
                  key={state}
                  type="button"
                  className={`${filters.stateRow} ${selected ? filters.isOn : ''}`}
                  data-state={state}
                  aria-pressed={selected}
                  title={`${selected ? 'Hide' : 'Show'} ${stateLabel(state).toLowerCase()} jobs`}
                  onClick={() => onToggleState(state)}
                >
                  <span className={filters.checkbox} aria-hidden="true">
                    {selected && <Icon name="check" size={12} />}
                  </span>
                  <span className={filters.stateIcon}>
                    <Icon name={stateIcon(state)} size={15} />
                  </span>
                  <span className={filters.stateName}>{stateLabel(state)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={filters.filterSection}>
          <span className={filters.filterLabel}>Commit</span>
          <div className={filters.fieldGrid}>
            <div className={controls.inputGroup}>
              <span className={controls.inputGroupAddon}>
                <Icon name="tag" />
              </span>
              <input
                className={inputClass}
                type="text"
                placeholder="Full commit SHA"
                title="Exact match: enter the full 40-character SHA"
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
                placeholder="Exact author name"
                title="Exact match: enter the full commit author name"
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
                <div className={filters.prStates} role="group" aria-label="Hide PR states">
                  <button
                    type="button"
                    className={`${filters.prToggle} ${!params.prstates.open ? filters.isOn : ''}`}
                    aria-pressed={!params.prstates.open}
                    title={`${!params.prstates.open ? 'Show' : 'Hide'} open PRs`}
                    onClick={() => onToggleHiddenPrState('open')}
                  >
                    No Open
                  </button>
                  <button
                    type="button"
                    className={`${filters.prToggle} ${!params.prstates.closed ? filters.isOn : ''}`}
                    aria-pressed={!params.prstates.closed}
                    title={`${!params.prstates.closed ? 'Show' : 'Hide'} closed PRs`}
                    onClick={() => onToggleHiddenPrState('closed')}
                  >
                    No Closed
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
          </div>
        </div>

        <div className={filters.filterSection}>
          <div className={filters.sectionHead}>
            <span className={filters.filterLabel}>PR labels</span>
            {params.labels.length > 0 && (
              <button type="button" className={filters.selectAll} onClick={onClearLabels}>
                Clear
              </button>
            )}
          </div>
          <div className={filters.labelList} role="group" aria-label="PR labels">
            {LABEL_OPTIONS.map((label) => {
              const on = params.labels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  className={`${filters.labelChip} ${on ? filters.isOn : ''}`}
                  aria-pressed={on}
                  title={`${on ? 'Stop filtering by' : 'Only show jobs labeled'} "${label}"`}
                  onClick={() => onToggleLabel(label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={filters.filterSection}>
          <span className={filters.filterLabel}>Total (non-filtered) Jobs to load</span>
          <div className={filters.segmented} role="group" aria-label="Jobs to load">
            {LIMIT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={Number(params.limit) === option ? filters.isOn : ''}
                aria-pressed={Number(params.limit) === option}
                onClick={() => chooseLimit(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={filters.filterActions}>
          <button type="button" className={`${controls.btn} ${controls.btnGhost}`} onClick={onReset}>
            Reset
          </button>
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

      {pendingLimit !== null && (
        <ConfirmDialog
          title="Load more jobs?"
          message={`Loading ${pendingLimit} jobs is slow and puts extra load on the CI. Continue?`}
          confirmLabel="Load"
          onConfirm={() => {
            onLimit(pendingLimit);
            setPendingLimit(null);
          }}
          onCancel={() => setPendingLimit(null)}
        />
      )}
    </section>
  );
}
