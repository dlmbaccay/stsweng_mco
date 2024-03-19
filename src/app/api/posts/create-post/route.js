import { NextResponse } from 'next/server';
import { uploadPostMedia } from '@/lib/storage-funcs';
import { firestore } from '@/lib/firebase';
import { createPostDocument} from '@/lib/firestore-crud';


export async function POST(request) {
    const formData = await request.formData();

    const postAuthorID = formData.get('postAuthorID');
    const postAuthorDisplayName = formData.get('postAuthorDisplayName');
    const postAuthorUsername = formData.get('postAuthorUsername');
    const postAuthorPhotoURL = formData.get('postAuthorPhotoURL');
    const postCategory = formData.get('postCategory');
    const postContent = formData.get('postContent');
    const postTaggedPets = JSON.parse(formData.get('postTaggedPets'));
    const postTrackerLocation = formData.get('postTrackerLocation');
    const postMedia = formData.getAll('files');

    try {
        const postID = await firestore.collection("posts").doc().id;
        const promises = [];
        if (postMedia.length > 0) {
            postMedia.forEach((file) => {
                promises.push(uploadPostMedia(postID, file));
            });
        }
        Promise.all(promises).then(async (values) => {
            const postDetails = {
                postID: postID,
                authorID: postAuthorID,
                authorUsername: postAuthorUsername,
                authorDisplayName: postAuthorDisplayName,
                authorPhotoURL: postAuthorPhotoURL,
                content: postContent,
                category: postCategory,
                taggedPets: postTaggedPets,
                location: (postCategory == "Lost Pets" || postCategory == "Unknown Owner") ? postTrackerLocation : "",
                imageURLs: values,
                isEdited: false,
                reports: [],
                reportStatus: "pending",
                date: new Date().toISOString()
            };
            // Call a function to save the post details to the database
            await createPostDocument("posts", postDetails.postID, postDetails);
        });
        return NextResponse.json({ message: "Post created successfully." }, {status: 200});

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
