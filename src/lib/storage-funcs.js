import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function uploadUserProfilePhoto(userid, userPhotoFile) {
    const storagePath = `userProfile/${userid}/profilePic`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, userPhotoFile);

    // ... Handle upload progress, error handling if desired

    await uploadTask; // Wait for the upload to complete

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

export async function uploadUserCoverPhoto(userid, coverPhotoFile) {
    const storagePath = `userProfile/${userid}/coverPhoto`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, coverPhotoFile);

    // ... Handle upload progress, error handling if desired

    await uploadTask; // Wait for the upload to complete

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
