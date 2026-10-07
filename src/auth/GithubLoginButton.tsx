import { useAuth } from '../auth/AuthContext';
import styles from './GithubLoginButton.module.css';
import controls from '../styles/controls.module.css';
import menu from '../components/Menu.module.css';
import { Icon } from '../components/Icon';
import { Menu } from '../components/Menu';

export function GithubLoginButton() {
  const { user, canManage, enabled, login, logout } = useAuth();

  if (!enabled) return null;

  if (!user) {
    return (
      <button
        type="button"
        className={`${controls.btn} ${controls.btnGhost} ${controls.btnSm}`}
        onClick={login}
      >
        <Icon name="github" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <Menu
      label="Account"
      trigger={<img className={styles.avatar} src={user.avatarUrl} alt={user.login} />}
    >
      <div className={menu.menuItem} style={{ cursor: 'default' }}>
        <Icon name={canManage ? 'shield' : 'person'} />
        <span>{canManage ? 'Maintainer' : 'User'}</span>
      </div>
      <button type="button" className={menu.menuItem} onClick={logout}>
        <Icon name="logout" />
        <span>Logout</span>
      </button>
    </Menu>
  );
}
