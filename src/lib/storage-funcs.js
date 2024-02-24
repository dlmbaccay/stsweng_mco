import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function uploadUserProfilePhoto(user, userPhotoFile) {
    const storagePath = `userProfile/${user.uid}/profilePic`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, userPhotoFile);

    // ... Handle upload progress, error handling if desired

    await uploadTask; // Wait for the upload to complete

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
