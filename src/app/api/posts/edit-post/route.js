import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { updateDocument } from '@/lib/firestore-crud'; // Ensure this import is correct

export async function POST(request) {
    const formData = await request.formData();

    const postID = formData.get('postID');
    const postContent = formData.get('postContent');
    const postCategory = formData.get('postCategory');
    const isEdited = formData.get('isEdited');
    // console.log(isEdited)
    // console.log('Response:', formData);
    // const postTrackerLocation = formData.get('postTrackerLocation');

    try {
        // Use the updateDocument function from firestore-crud.js
        await updateDocument("posts", postID, {
            content: postContent,
            category: postCategory,
            isEdited: isEdited === "true"
            // location: (postCategory === "Lost Pets" || postCategory === "Unknown Owner") ? postTrackerLocation : ""
        });

        return NextResponse.json({ message: "Post updated successfully." }, { status: 200 });

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}