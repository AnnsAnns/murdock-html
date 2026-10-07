import controls from '../styles/controls.module.css';
import misc from '../styles/misc.module.css';

export function ShowMore({ onClick }) {
  return (
    <div className={misc.showMore}>
      <button type="button" className={controls.btn} onClick={onClick}>
        Show more
      </button>
    </div>
  );
}
