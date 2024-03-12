// Mock the Firebase modules and methods used in storage-funcs.js
jest.mock('firebase/storage', () => ({
    ref: jest.fn((storage, path) => ({ storage, path })),
    uploadBytesResumable: jest.fn((storageRef, file) => {
      return {
        then: jest.fn((resolve) => resolve({
          ref: {
            // Simulate the ref's fullPath for testing
            fullPath: storageRef.path, // Assuming path is the fullPath for simplicity
          }
        }))
      };
    }),
    getDownloadURL: jest.fn(() => Promise.resolve('mockDownloadURL')),
    deleteObject: jest.fn(() => Promise.resolve()),
  }));

  import { 
    uploadUserProfilePhoto, 
    uploadUserCoverPhoto, 
    uploadPetProfilePhoto, 
    deletePhotoFromStorage, 
    uploadPostMedia 
  } from '../lib/storage-funcs';
  import * as firebase from 'firebase/storage';
  
  describe('Storage Functions', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });
  
    it('uploads user profile photo and returns download URL', async () => {
      const downloadURL = await uploadUserProfilePhoto('userid', new Blob());
      expect(downloadURL).toBe('mockDownloadURL');
      expect(firebase.uploadBytesResumable).toHaveBeenCalled();
      expect(firebase.getDownloadURL).toHaveBeenCalled();
    });
  
    it('uploads user cover photo and returns download URL', async () => {
      const downloadURL = await uploadUserCoverPhoto('userid', new Blob());
      expect(downloadURL).toBe('mockDownloadURL');
      expect(firebase.uploadBytesResumable).toHaveBeenCalled();
      expect(firebase.getDownloadURL).toHaveBeenCalled();
    });
  
    it('uploads pet profile photo and returns download URL', async () => {
      const downloadURL = await uploadPetProfilePhoto('petID', new Blob());
      expect(downloadURL).toBe('mockDownloadURL');
      expect(firebase.uploadBytesResumable).toHaveBeenCalled();
      expect(firebase.getDownloadURL).toHaveBeenCalled();
    });
  
    it('deletes photo from storage successfully', async () => {
      const response = await deletePhotoFromStorage('collection', 'documentId', 'type');
      expect(response).toBe('File deleted successfully');
      expect(firebase.deleteObject).toHaveBeenCalled();
    });
  
    it('uploads post media and returns download URL', async () => {
      const downloadURL = await uploadPostMedia('postID', new Blob());
      expect(downloadURL).toBe('mockDownloadURL');
      expect(firebase.uploadBytesResumable).toHaveBeenCalled();
      expect(firebase.getDownloadURL).toHaveBeenCalled();
    });
  });
  