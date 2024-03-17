import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { createReplyDocument } from '@/lib/firestore-crud';


export async function POST(request) {
    const formData = await request.formData();

    const postID = formData.get('postID');
    const commentID = formData.get('commentID');
    const postAuthorID = formData.get('postAuthorID');
    const postAuthorDisplayName = formData.get('postAuthorDisplayName');
    const postAuthorUsername = formData.get('postAuthorUsername');
    const postAuthorPhotoURL = formData.get('postAuthorPhotoURL');
    const replyBody = formData.get('replyBody');
    const replyDate = formData.get('replyDate');
    const authorID = formData.get('authorID');
    const authorDisplayName = formData.get('authorDisplayName');
    const authorUsername = formData.get('authorUsername');
    const authorPhotoURL = formData.get('authorPhotoURL');

    try {
        const replyID = await firestore.collection("posts").doc(postID).collection("comments").doc(commentID).collection("replies").doc().id;
        const replyDetails = {
            commentID: commentID,
            postID: postID,
            postAuthorID: postAuthorID,
            postAuthorDisplayName: postAuthorDisplayName,
            postAuthorUsername: postAuthorUsername,
            postAuthorPhotoURL: postAuthorPhotoURL,
            replyBody: replyBody,
            replyDate: replyDate,
            authorID: authorID,
            authorDisplayName: authorDisplayName,
            authorUsername: authorUsername,
            authorPhotoURL: authorPhotoURL,
            isEdited: false,
        };
        // Call a function to save the post details to the database
        await createReplyDocument(postID, commentID, replyID, replyDetails);
        return NextResponse.json({ message: "Reply created successfully." }, {status: 200});

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
