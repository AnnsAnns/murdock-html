import { useAuth } from '../auth/AuthContext';
import { Icon } from '../components/Icon';
import { Menu } from '../components/Menu';

export function GithubLoginButton() {
  const { user, canManage, enabled, login, logout } = useAuth();

  if (!enabled) return null;

  if (!user) {
    return (
      <button type="button" className="btn btn--ghost btn--sm" onClick={login}>
        <Icon name="github" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <Menu
      label="Account"
      trigger={<img className="avatar" src={user.avatarUrl} alt={user.login} />}
    >
      <div className="menu-item" style={{ cursor: 'default' }}>
        <Icon name={canManage ? 'shield' : 'person'} />
        <span>{canManage ? 'Maintainer' : 'User'}</span>
      </div>
      <button type="button" className="menu-item" onClick={logout}>
        <Icon name="logout" />
        <span>Logout</span>
      </button>
    </Menu>
  );
}
