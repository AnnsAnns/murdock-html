import { useEffect } from 'react';

/** Set the document title for the lifetime of a page component. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
