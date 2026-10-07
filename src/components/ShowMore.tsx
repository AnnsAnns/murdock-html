import controls from '../styles/controls.module.css';
import misc from '../styles/misc.module.css';

interface ShowMoreProps {
  onClick: () => void;
}

export function ShowMore({ onClick }: ShowMoreProps) {
  return (
    <div className={misc.showMore}>
      <button type="button" className={controls.btn} onClick={onClick}>
        Show more
      </button>
    </div>
  );
}
