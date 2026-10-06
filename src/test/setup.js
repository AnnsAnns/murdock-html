import '@testing-library/jest-dom/vitest';

// jsdom lacks matchMedia; a few components/Intl paths may probe it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

// jsdom has no WebSocket; the socket hook should no-op in tests.
if (typeof window !== 'undefined' && !window.WebSocket) {
  window.WebSocket = class {
    constructor() {
      this.readyState = 0;
    }
    close() {}
    send() {}
  };
}
