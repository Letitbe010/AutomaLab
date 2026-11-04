import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// jsdom has no ResizeObserver; the editor canvas only needs it to exist.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
