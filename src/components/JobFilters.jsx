import { JOB_TYPES } from '../api/query';
import { STATES, stateIcon, stateLabel } from '../utils/state';
import { Icon } from './Icon';

const TYPE_LABELS = { all: 'All', pr: 'PRs', branch: 'Branches', tag: 'Tags' };

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
}) {
  const onKeyDown = (event) => {
    if (event.key === 'Enter') onCommit();
  };

  return (
    <section className="box filter-panel">
      <div className="box-title">
        <Icon name="search" size={14} />
        <span className="title-label">Filters</span>
      </div>

      <div className="box-body">
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Type</span>
            <div className="segmented" role="group" aria-label="Job type">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={params.type === type ? 'is-on' : ''}
                  aria-pressed={params.type === type}
                  onClick={() => onType(type)}
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">States</span>
            <div className="toolbar-group" role="group" aria-label="Job states">
              {STATES.map((state) => {
                const on = params.states.includes(state);
                return (
                  <button
                    key={state}
                    type="button"
                    className={`toggle ${on ? 'is-on' : ''}`}
                    data-state={state}
                    aria-pressed={on}
                    title={`${on ? 'Hide' : 'Show'} ${stateLabel(state).toLowerCase()} jobs`}
                    onClick={() => onToggleState(state)}
                  >
                    <Icon name={stateIcon(state)} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="input-group">
            <span className="input-group-addon">
              <Icon name="tag" />
            </span>
            <input
              className="input"
              type="text"
              placeholder="Commit SHA"
              aria-label="Commit SHA"
              value={draft.sha}
              onChange={(event) => onDraftChange('sha', event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          <div className="input-group">
            <span className="input-group-addon">
              <Icon name="person" />
            </span>
            <input
              className="input"
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
              <div className="input-group">
                <span className="input-group-addon">PR #</span>
                <input
                  className="input"
                  type="text"
                  placeholder="PR number"
                  aria-label="PR number"
                  value={draft.prnum}
                  onChange={(event) => onDraftChange('prnum', event.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div className="toolbar-group" role="group" aria-label="PR state">
                <button
                  type="button"
                  className={`toggle ${params.prstates.open ? 'is-on' : ''}`}
                  aria-pressed={params.prstates.open}
                  onClick={() => onTogglePrState('open')}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={`toggle ${params.prstates.closed ? 'is-on' : ''}`}
                  aria-pressed={params.prstates.closed}
                  onClick={() => onTogglePrState('closed')}
                >
                  Closed
                </button>
              </div>
            </>
          )}

          {params.type === 'branch' && (
            <div className="input-group">
              <span className="input-group-addon">Branch</span>
              <input
                className="input"
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
            <div className="input-group">
              <span className="input-group-addon">Tag</span>
              <input
                className="input"
                type="text"
                placeholder="Tag name"
                aria-label="Tag name"
                value={draft.tag}
                onChange={(event) => onDraftChange('tag', event.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          <button type="button" className="btn filter-search" onClick={onCommit}>
            <Icon name="search" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </section>
  );
}
