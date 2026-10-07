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
  /** Toggle a state's exclusion (a hidden state is filtered out). */
  onToggleHiddenState: (state: JobState) => void;
  onClearStates: () => void;
  /** Toggle an excluded PR state (`open` / `closed`). */
  onToggleHiddenPrState: (key: 'open' | 'closed') => void;
  onDraftChange: (field: keyof DraftParams, value: string) => void;
  onCommit: () => void;
  onReset: () => void;
}

/** Dashboard filter panel. Text fields are drafted locally and committed on
 *  Enter or the Search button so typing doesn't spam the URL. */
export function JobFilters({
  params,
  draft,
  onType,
  onToggleHiddenState,
  onClearStates,
  onToggleHiddenPrState,
  onDraftChange,
  onCommit,
  onReset,
}: JobFiltersProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onCommit();
  };

  const inputClass = `${controls.input} ${filters.filterInput}`;
  // State filters are inverted: a selected state is one to hide, so by default
  // nothing is selected and every state is shown.
  const hiddenCount = STATES.length - params.states.length;
  const noneHidden = hiddenCount === 0;

  // How far the applied filters deviate from the defaults.
  const activeCount =
    (params.type !== 'all' ? 1 : 0) +
    (noneHidden ? 0 : 1) +
    (params.type === 'pr' && (!params.prstates.open || !params.prstates.closed) ? 1 : 0) +
    (params.sha ? 1 : 0) +
    (params.author ? 1 : 0) +
    (params.type === 'pr' && params.prnum ? 1 : 0) +
    (params.type === 'branch' && params.branch ? 1 : 0) +
    (params.type === 'tag' && params.tag ? 1 : 0);

  return (
    <section className={`${box.box} ${filters.filterPanel}`}>
      <div className={box.boxTitle}>
        <Icon name="filter" size={14} />
        <span className={box.titleLabel}>Filters</span>
        {activeCount > 0 && <span className={filters.activeBadge}>{activeCount} active</span>}
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
          <div className={filters.sectionHead}>
            <span className={filters.filterLabel}>Hide states</span>
            <span className={filters.stateSummary}>
              <span>{noneHidden ? 'All states shown' : `${hiddenCount} hidden`}</span>
              {!noneHidden && (
                <button type="button" className={filters.selectAll} onClick={onClearStates}>
                  Show all
                </button>
              )}
            </span>
          </div>
          <div className={filters.stateList} role="group" aria-label="Hide job states">
            {STATES.map((state) => {
              const hidden = !params.states.includes(state);
              return (
                <button
                  key={state}
                  type="button"
                  className={`${filters.stateRow} ${hidden ? filters.isOn : ''}`}
                  data-state={state}
                  aria-pressed={hidden}
                  title={`${hidden ? 'Show' : 'Hide'} ${stateLabel(state).toLowerCase()} jobs`}
                  onClick={() => onToggleHiddenState(state)}
                >
                  <span className={filters.checkbox} aria-hidden="true">
                    {hidden && <Icon name="check" size={12} />}
                  </span>
                  <span className={filters.stateIcon}>
                    <Icon name={stateIcon(state)} size={15} />
                  </span>
                  <span className={filters.stateName}>No {stateLabel(state)}</span>
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
                placeholder="SHA, e.g. 3f9c2ab"
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
                placeholder="Author name or email"
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
    </section>
  );
}
