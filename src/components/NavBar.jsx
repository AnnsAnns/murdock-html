import { Link, NavLink } from 'react-router-dom';
import { API_BASE, GITHUB_REPO_URL, PRIVACY_URL } from '../api/config';
import frog from '../imgs/frog.webp';
import { Icon } from './Icon';
import { GithubLoginButton } from '../auth/GithubLoginButton';

export function NavBar() {
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
        <a
          className="icon-btn"
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
