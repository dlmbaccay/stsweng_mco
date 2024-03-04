import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

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

export async function uploadPetProfilePhoto(petID, petPhotoFile) {
    const storagePath = `petProfile/${petID}/profilePic`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, petPhotoFile);

    // ... Handle upload progress, error handling if desired

    await uploadTask; // Wait for the upload to complete

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// type is either 'profilePic', 'coverPhoto', or 'postPhotoN'
export async function deletePhotoFromStorage(collection, documentId, type) {
    const storagePath = `${collection}/${documentId}/${type}`;
    const storageRef = ref(storage, storagePath);

    // Delete the file
    await deleteObject(storageRef);

    return 'File deleted successfully';
}