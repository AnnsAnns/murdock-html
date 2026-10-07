import { useEffect, useRef, useState } from 'react';
import { fetchText } from '../api/murdock';
import controls from '../styles/controls.module.css';
import outputStyles from './JobOutput.module.css';
import { Icon } from './Icon';

/** Scrollable log viewer with jump-to-top/bottom controls. */
export function JobOutput({ job, output }) {
  const [text, setText] = useState(() => output ?? null);
  const scrollRef = useRef(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  // Live output is streamed in by the parent; fall back to the text URL.
  useEffect(() => {
    setText(output ?? '');
  }, [output]);

  useEffect(() => {
    if (output || !job.output_text_url) return undefined;
    let cancelled = false;
    fetchText(job.output_text_url)
      .then((data) => {
        if (!cancelled) setText(data);
      })
      .catch(() => {
        if (!cancelled) setText('');
      });
    return () => {
      cancelled = true;
    };
  }, [output, job.output_text_url]);

  const measure = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtTop(el.scrollTop <= 1);
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
  };

  useEffect(measure, [text]);

  const scrollTo = (top) => scrollRef.current?.scrollTo({ top, behavior: 'smooth' });

  if (text === null) return null;

  return (
    <div className={outputStyles.output}>
      <div className={outputStyles.outputScroll} ref={scrollRef} onScroll={measure}>
        <pre>{text || 'No output available.'}</pre>
      </div>
      <div className={outputStyles.outputActions}>
        {!atTop && (
          <button
            type="button"
            className={`${controls.iconBtn} ${outputStyles.outputActionBtn}`}
            title="Go to top"
            onClick={() => scrollTo(0)}
          >
            <Icon name="arrowUp" />
          </button>
        )}
        {!atBottom && (
          <button
            type="button"
            className={`${controls.iconBtn} ${outputStyles.outputActionBtn}`}
            title="Go to bottom"
            onClick={() => scrollTo(scrollRef.current?.scrollHeight ?? 0)}
          >
            <Icon name="arrowDown" />
          </button>
        )}
      </div>
    </div>
  );
}
