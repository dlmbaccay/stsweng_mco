import { toast } from 'react-hot-toast';
import { handleImageFilePreview } from '../lib/helper-functions.js';

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

describe('handleImageFilePreview', () => {
    beforeEach(() => {
        // Clear all mock instances and calls before each test
        jest.clearAllMocks();
    });
  
    it('returns null when no file is provided', () => {
        const result = handleImageFilePreview(null);
        expect(result).toBeNull();
    });
    
    it('returns a preview URL for allowed file types', () => {
        // Arrange
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        global.URL.createObjectURL.mockReturnValue('mockPreviewUrl');
        // Act
        const result = handleImageFilePreview(mockFile);
        // Assert
        expect(result).toEqual([mockFile, 'mockPreviewUrl']);
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });
  
    it('shows an error toast for disallowed file types', () => {
        const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
        const result = handleImageFilePreview(mockFile);
  
        expect(toast.error).toHaveBeenCalledWith('Invalid file type. Only PNG, JPEG, and GIF allowed.');
        expect(result).toBe(0);
    });
  });
  
  