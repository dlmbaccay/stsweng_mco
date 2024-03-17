import { NextResponse } from 'next/server';
import { uploadPostMedia } from '@/lib/storage-funcs';
import { firestore } from '@/lib/firebase';
import { createCommentDocument } from '@/lib/firestore-crud';


export async function POST(request) {
    const formData = await request.formData();

    const postID = formData.get('postID');
    const postAuthorID = formData.get('postAuthorID');
    const postAuthorDisplayName = formData.get('postAuthorDisplayName');
    const postAuthorUsername = formData.get('postAuthorUsername');
    const postAuthorPhotoURL = formData.get('postAuthorPhotoURL');
    const commentBody = formData.get('commentBody');
    const commentDate = formData.get('commentDate');
    const authorID = formData.get('authorID');
    const authorDisplayName = formData.get('authorDisplayName');
    const authorUsername = formData.get('authorUsername');
    const authorPhotoURL = formData.get('authorPhotoURL');

    try {
        const commentID = await firestore.collection("posts").doc(postID).collection("comments").doc().id;
        const commentDetails = {
            commentID: commentID,
            postID: postID,
            postAuthorID: postAuthorID,
            postAuthorDisplayName: postAuthorDisplayName,
            postAuthorUsername: postAuthorUsername,
            postAuthorPhotoURL: postAuthorPhotoURL,
            commentBody: commentBody,
            commentDate: commentDate,
            authorID: authorID,
            authorDisplayName: authorDisplayName,
            authorUsername: authorUsername,
            authorPhotoURL: authorPhotoURL,
            isEdited: false,
        };
        // Call a function to save the post details to the database
        // await createPostDocument("posts", postDetails.postID, postDetails);
        await createCommentDocument(postID, commentID, commentDetails);
        return NextResponse.json({ message: "Comment created successfully." }, {status: 200});

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
