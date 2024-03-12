// jest.setup.js (Used for Back-end Testing for CRUD Operations)
jest.mock('../lib/firebase', () => {
  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn().mockReturnThis(),
  };

  return {
      auth: jest.fn(),
      googleAuthProvider: jest.fn(),
      firestore: mockFirestore,
  };
});

if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill fetch, Request, Response, Headers globally using whatwg-fetch, node-fetch, or similar
// Add the global fetch, Request, Response, and Headers setup here
global.fetch = require('node-fetch');
global.Request = global.fetch.Request;
global.Response = global.fetch.Response;
global.Headers = global.fetch.Headers;
