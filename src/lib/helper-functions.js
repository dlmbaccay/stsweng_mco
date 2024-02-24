import { toast } from 'react-hot-toast';

export function handleImageFilePreview(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Adjust allowed types as needed

    if (file) {
        // Ensure file is within allowed types
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only PNG, JPEG, and GIF allowed.');
            return 0; // Early exit if invalid type
        }

        const previewUrl = URL.createObjectURL(file);

        return [file, previewUrl]
    } else {
        // Handle case where no file is selected
        return null;
    }
}

