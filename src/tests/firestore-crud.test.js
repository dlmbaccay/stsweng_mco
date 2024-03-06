const { fetchData, createDocument, createUserDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentById, getDocumentsWithCondition, getDocumentByFieldValue, isUsernameTaken, createPetDocument } = require('../lib/firestore-crud');
const { firestore } = require('../lib/firebase');

beforeEach(() => {
  jest.clearAllMocks();

  firestore.collection.mockReturnThis();
  firestore.doc.mockReturnThis();
  firestore.where.mockReturnThis();

  // Default Mocks (Comment/Uncomment to simulate success or failure)
  firestore.get.mockResolvedValue({ docs: [{ id: '1', data: () => ({ name: 'Mocker' }) }] }); // Simulate fetching documents successfully
  // firestore.get.mockRejectedValue(new Error('Firestore operation failed')); // Uncomment to simulate a Firestore error

  firestore.add.mockResolvedValue({ id: '123' }); // Simulate successful document addition
  // firestore.add.mockRejectedValue(new Error('Adding document failed')); // Uncomment to simulate adding document error

  firestore.set.mockResolvedValue(undefined); // Simulate successful document set
  // firestore.set.mockRejectedValue(new Error('Setting document failed')); // Uncomment to simulate setting document error

  firestore.update.mockResolvedValue('Document updated successfully'); // Simulate successful document update
  // firestore.update.mockRejectedValue(new Error('Updating document failed')); // Uncomment to simulate updating document error

  firestore.delete.mockResolvedValue('Document deleted successfully'); // Simulate successful document deletion
  // firestore.delete.mockRejectedValue(new Error('Deleting document failed')); // Uncomment to simulate deleting document error
});

describe('firestore-crud', () => {
    // Already provided tests for fetchData and createDocument...
    
    // Test createUserDocument function
    describe('createUserDocument', () => {
        it('should create a new User document in a collection with given data', async () => {
            const result = await createUserDocument('users', 'userId', { name: 'John Doe' });
            expect(result).toEqual('userId'); // Assuming function returns the documentId
        });
    });

    // Test updateDocument function
    describe('updateDocument', () => {
        it('should update a document in a collection', async () => {
            const result = await updateDocument('users', 'userId', { name: 'Jane Doe' });
            expect(result).toEqual('Document updated successfully');
        });
    });

    // Test deleteDocument function
    describe('deleteDocument', () => {
        it('should delete a document in a collection', async () => {
            const result = await deleteDocument('users', 'userId');
            expect(result).toEqual('Document deleted successfully');
        });
    });

    // Test getAllDocuments function
    describe('getAllDocuments', () => {
        it('should get all documents in a collection', async () => {
            const data = await getAllDocuments('users');
            expect(data).toEqual([{ name: 'Mocker' }]);
        });
    });

    // Test getDocumentById function
    describe('getDocumentById', () => {
        beforeEach(() => {
            // Reset mocks
            jest.clearAllMocks();
    
            // Mock firestore.doc().get() to return a document snapshot with data
            firestore.doc.mockReturnThis();
            firestore.get.mockResolvedValue({
                exists: true,
                data: () => ({ name: 'Mocker' }) // This simulates finding a document with data
            });
        });
    
        it('should get a document by ID from a collection', async () => {
            const data = await getDocumentById('users', '1');
            expect(data).toEqual({ name: 'Mocker' });
        });
    });

    // Test getDocumentsWithCondition function
    describe('getDocumentsWithCondition', () => {
        it('should fetch documents in a collection with a specific condition', async () => {
            const data = await getDocumentsWithCondition('users', 'name', '==', 'Mocker');
            expect(data).toEqual([{ name: 'Mocker' }]);
        });
    });

    // Test getDocumentByFieldValue function
    describe('getDocumentByFieldValue', () => {
        it('should get a document that matches a value in a field', async () => {
            const data = await getDocumentByFieldValue('users', 'name', 'Mocker');
            expect(data).toEqual({ name: 'Mocker' });
        });
    });

    // Test isUsernameTaken function
    describe('isUsernameTaken', () => {
        it('should check for documents with a specific username', async () => {
            const isTaken = await isUsernameTaken('Mocker');
            expect(isTaken).toBe(true); // Assuming non-empty response means username is taken
        });
    });

    // Test createPetDocument function
    describe('createPetDocument', () => {
        it('should create a new pet document in a collection', async () => {
            const result = await createPetDocument('pets', 'petId', { name: 'Rover' });
            // Since createPetDocument's functionality includes setting data without a direct return, we assume success if no error is thrown
            expect(result).toBeUndefined(); // No value returned indicates success in this mock setup
        });
    });
});