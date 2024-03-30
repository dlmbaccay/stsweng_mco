import { toast } from 'react-hot-toast';
import { firestore } from './firebase';
import { updateDocument} from './firestore-crud';

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

export function handleDateFormat(date) {
    const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = new Date(date).toLocaleString('en-US', options);
    return formattedDate;
}

export function handleTimestampFormat(date) {
    const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = new Date(date.toDate()).toLocaleString('en-US', options);
    return formattedDate;
}

export async function checkIfBannable(authorID) {
    const postsRef = firestore.collection('posts');
    const querySnapshot = await postsRef.where('authorID', '==', authorID).where('reportStatus', '==', 'verified').get();

    if (querySnapshot.empty) {
        return false; // No posts with verified reportStatus found
    } else {
        if (querySnapshot.size >= 5) {
            // Update user's ban status 
            await updateDocument('users', authorID, {ban: {status: "permanent", until: "none"}});
            // Create a notification for admin
            const notifData = {
                type: "ban",
                userID: post.authorID,
                username: post.authorUsername,
                userPhotoURL: post.authorPhotoURL,
                desc: "permanently banned due to multiple verified reports",
                banStatus: "permanent",
                until: "none",
                createdAt: new Date()
            }

            const adminDocRef = firestore.collection('admin').doc("5QMdCpbNvBMBSJ0wY9i28adWdx72");
            await adminDocRef.collection('notifications').add(notifData);
        }
        return true; // At least one post with verified reportStatus found
    }
}
