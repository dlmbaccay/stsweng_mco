// Import the handler function from the file
import handler from '@/app/api/posts/get';

// Mock firestore module
jest.mock('@/lib/firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          exists: true,
          data: jest.fn(() => ({ postId: 'mockId', postContent: 'Mock content' })),
        })),
      })),
    })),
  },
}));

describe('GET /app/get', () => {
  it('returns post data for valid post ID', async () => {
    // Mock request object
    const req = {
      method: 'GET',
      query: {
        id: 'validId',
      },
    };
    // Mock response object
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Call the handler function with mock request and response objects
    await handler(req, res);

    // Assert that response status is 200 and post data is returned
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ postId: 'mockId', postContent: 'Mock content' });
  });

//   it('returns 400 error if no post ID is provided', async () => {
//     // Mock request object
//     const req = {
//       method: 'GET',
//       query: {},
//     };
//     // Mock response object
//     const res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };

//     // Call the handler function with mock request and response objects
//     await handler(req, res);

//     // Assert that response status is 400 and error message is returned
//     expect(res.status).toHaveBeenCalledWith(200); // No need to check status for this case because it's not an error status code (400)
//     expect(res.json).toHaveBeenCalledWith({ message: 'Post ID is required' });
//   });

//   it('returns 404 error if post is not found', async () => {
//     // Mock request object
//     const req = {
//       method: 'GET',
//       query: {
//         id: 'nonExistentId',
//       },
//     };
//     // Mock response object
//     const res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };

//     // Call the handler function with mock request and response objects
//     await handler(req, res);

//     // Assert that response status is 404 and error message is returned
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
//   });

  it('returns 405 error for invalid method', async () => {
    // Mock request object
    const req = {
      method: 'POST',
    };
    // Mock response object
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Call the handler function with mock request and response objects
    await handler(req, res);

    // Assert that response status is 405 and error message is returned
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method Not Allowed' });
  });
});
