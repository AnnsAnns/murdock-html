import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Murdock - Not found');
  return (
    <div className="empty-state">
      <h2>Page not found</h2>
      <p>
        <Link to="/">Back to the dashboard</Link>
      </p>
    </div>
  );
}
