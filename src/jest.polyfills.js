/**
 * Jest Polyfills
 * This file runs before Jest loads any modules
 * Required for MSW v2 compatibility with jsdom
 */

const { TextEncoder, TextDecoder } = require('util');

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill BroadcastChannel
global.BroadcastChannel = class BroadcastChannel {
  constructor() {}
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

// Polyfill ReadableStream if not available
if (typeof global.ReadableStream === 'undefined') {
  const { ReadableStream, TransformStream, WritableStream } = require('stream/web');
  global.ReadableStream = ReadableStream;
  global.TransformStream = TransformStream;
  global.WritableStream = WritableStream;
}

// Polyfill structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Polyfill fetch, Request, Response, Headers for MSW v2
const { fetch, Request, Response, Headers, FormData } = require('undici');
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.FormData = FormData;

// Polyfill matchMedia for framer-motion and responsive components
// This needs to be defined early before any modules load
Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill window object if not available
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Ensure window.matchMedia is also defined
if (typeof global.window.matchMedia === 'undefined') {
  global.window.matchMedia = global.matchMedia;
}
