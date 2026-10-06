import { useEffect } from 'react';

/** Set the document title for the lifetime of a page component. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

/** Swap the favicon (used to signal pass/fail on job pages). */
export function useFavicon(href) {
  useEffect(() => {
    if (!href) return;
    const link = document.getElementById('favicon');
    if (link) link.href = href;
  }, [href]);
}
