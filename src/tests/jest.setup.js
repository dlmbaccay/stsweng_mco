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
        firestore: {
          collection: jest.fn().mockReturnThis(),
          doc: jest.fn().mockReturnThis(),
          get: jest.fn(),
          add: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          where: jest.fn().mockReturnThis(),
        },
  }
});
  