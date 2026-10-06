export function ShowMore({ onClick }) {
  return (
    <div className="show-more">
      <button type="button" className="btn" onClick={onClick}>
        Show more
      </button>
    </div>
  );
}
