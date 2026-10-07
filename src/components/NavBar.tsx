import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { API_BASE, GITHUB_REPO_URL, PRIVACY_URL } from '../api/config';
import { activeFilterCount, queryStringToQueryParams } from '../api/query';
import frog from '../imgs/frog.webp';
import controls from '../styles/controls.module.css';
import { Icon } from './Icon';
import { GithubLoginButton } from '../auth/GithubLoginButton';
import { useFilters } from './FiltersContext';
import nav from './NavBar.module.css';

export function NavBar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { open, toggle } = useFilters();

  const onDashboard = pathname === '/';
  const activeCount = activeFilterCount(queryStringToQueryParams(searchParams.toString()));

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <img className="brand-frog" src={frog} alt="" width={28} height={28} />
        <span>Murfrog</span>
      </Link>

      <nav className="topbar-nav" aria-label="Main">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <a className="nav-link" href={`${API_BASE}/api`} target="_blank" rel="noreferrer noopener">
          API <Icon name="external" size={12} />
        </a>
        <a className="nav-link" href={PRIVACY_URL} target="_blank" rel="noreferrer noopener">
          Privacy <Icon name="external" size={12} />
        </a>
      </nav>

      <div className="topbar-actions">
        {onDashboard && (
          <button
            type="button"
            className={`${nav.filterToggle}${open ? ` ${nav.isOn}` : ''}`}
            aria-pressed={open}
            aria-controls="job-filters"
            title={open ? 'Hide filters' : 'Show filters'}
            onClick={toggle}
          >
            <Icon name="filter" size={15} />
            <span>Show Filters</span>
            {activeCount > 0 && <span className={nav.count}>{activeCount}</span>}
          </button>
        )}
        <a
          className={controls.iconBtn}
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          title={GITHUB_REPO_URL}
          aria-label="Repository on GitHub"
        >
          <Icon name="github" />
        </a>
        <GithubLoginButton />
      </div>
    </header>
  );
}
