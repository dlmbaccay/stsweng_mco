import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';

export async function POST(request) {
    const formData = await request.formData();

    const postID = formData.get('postID');
    const postContent = formData.get('postContent');
    const postCategory = formData.get('postCategory');
    
    // retrieve postTrackerLocation
    const postTrackerLocation = formData.get('postTrackerLocation');

    try {
        // update post in the database
        await firestore.collection("posts").doc(postID).update({
            content: postContent,
            category: postCategory,
            location: (postCategory === "Lost Pets" || postCategory === "Unknown Owner") ? postTrackerLocation : ""
        });

        return NextResponse.json({ message: "Post updated successfully." }, { status: 200 });

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}