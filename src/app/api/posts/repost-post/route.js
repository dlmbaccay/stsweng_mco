import { NextResponse } from 'next/server';
import { uploadPostMedia } from '@/lib/storage-funcs';
import { firestore } from '@/lib/firebase';
import { createPostDocument} from '@/lib/firestore-crud';


export async function POST(request) {
    const formData = await request.formData();

    const postType = formData.get('postType');
    const postAuthorID = formData.get('postAuthorID');
    const postAuthorDisplayName = formData.get('postAuthorDisplayName');
    const postAuthorUsername = formData.get('postAuthorUsername');
    const postAuthorPhotoURL = formData.get('postAuthorPhotoURL');
    const postContent = formData.get('postContent');
    const originalPostID = formData.get('originalPostID');
    const originalPostAuthorID = formData.get('originalPostAuthorID');
    const originalPostAuthorDisplayName = formData.get('originalPostAuthorDisplayName');
    const originalPostAuthorUsername = formData.get('originalPostAuthorUsername');
    const originalPostAuthorPhotoURL = formData.get('originalPostAuthorPhotoURL');
    const originalPostDate = formData.get('originalPostDate');
    const originalPostContent = formData.get('originalPostContent');
    const originalPostCategory = formData.get('originalPostCategory');
    const originalPostTaggedPets = JSON.parse(formData.get('originalPostTaggedPets'));
    const originalPostTrackerLocation = formData.get('originalPostTrackerLocation');
    const originalPostType = formData.get('originalPostType');
    const originalPostMedia = formData.getAll('originalPostMedia');

    try {
        const postID = await firestore.collection("posts").doc().id;
        
        const postDetails = {
            postType: postType,
            postID: postID,
            authorID: postAuthorID,
            authorUsername: postAuthorUsername,
            authorDisplayName: postAuthorDisplayName,
            authorPhotoURL: postAuthorPhotoURL,
            content: postContent,
            originalPostID: originalPostID,
            originalPostAuthorID: originalPostAuthorID,
            originalPostAuthorDisplayName: originalPostAuthorDisplayName,
            originalPostAuthorUsername: originalPostAuthorUsername,
            originalPostAuthorPhotoURL: originalPostAuthorPhotoURL,
            originalPostDate: originalPostDate,
            originalPostContent: originalPostContent,
            originalPostCategory: originalPostCategory,
            originalPostTaggedPets: originalPostTaggedPets,
            originalPostTrackerLocation: originalPostTrackerLocation,
            originalPostType: originalPostType,
            originalPostMedia: originalPostMedia,
            isEdited: false,
            reports: [],
            reportStatus: "pending",
            date: new Date().toISOString()
        };

        // Call a function to save the post details to the database
        await createPostDocument("posts", postDetails.postID, postDetails);
        return NextResponse.json({ message: "Post created successfully." }, {status: 200});

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
