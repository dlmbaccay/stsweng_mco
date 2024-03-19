import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { updateDocument, getDocumentsWithCondition, createReportDocument, hasReported} from '@/lib/firestore-crud'; // Ensure this import is correct
import { create } from 'lodash';

export async function POST(request) {
    const body = await request.json();
    const { reportData, post} = body;

    try {
        // Check if the user has already reported the post
        if (post.reports.some((report) => report.reportedBy.uid === reportData.reportedBy.uid)) {
            return NextResponse.json({ message: "You have already reported this post." }, { status: 400 });
        }

        await updateDocument("posts", post.postID, {reports: [...post.reports, reportData], reportStatus: "pending"})

        return NextResponse.json({ message: "Report success." }, { status: 200 });

    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const postDocs = await getDocumentsWithCondition('posts', 'reports', ">", [] );
        if (postDocs) {
            return NextResponse.json({postDocs}, {status: 200});
        } else {
            return NextResponse.json({message: 'No reported posts found.'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}

export async function PATCH(request) {
    const body = await request.json();
    const { id, status} = body;
    try {
        // Use the updateDocument function from firestore-crud.js
        await updateDocument("posts", id, {
            reportStatus: status
        });
        return NextResponse.json({message: 'update success'}, {status: 200});
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}