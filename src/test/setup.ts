import '@testing-library/jest-dom/vitest';

// jsdom lacks matchMedia; a few components/Intl paths may probe it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// jsdom has no WebSocket; the socket hook should no-op in tests.
if (typeof window !== 'undefined' && !window.WebSocket) {
  window.WebSocket = class {
    readyState = 0;
    close() {}
    send() {}
  } as unknown as typeof WebSocket;
}
