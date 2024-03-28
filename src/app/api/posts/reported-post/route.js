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
            const existingReport = post.reports.find((report) => report.reportedBy.uid === reportData.reportedBy.uid);
            const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const currentTime = new Date().getTime();
            const reportTime = new Date(existingReport.createdAt).getTime();
            
            if (currentTime - reportTime >= twentyFourHours) {
                // Update the createdAt of the existing report
                existingReport.createdAt = reportData.createdAt;
                existingReport.description = reportData.description;
                existingReport.reasons = reportData.reasons;
                existingReport.otherReasons = reportData.otherReasons;

                await updateDocument("posts", post.postID, { reports: post.reports , reportStatus: "pending"});
                return NextResponse.json({ message: "Report success." }, { status: 200 });
            } else {
                return NextResponse.json({ message: "You have already reported this post." }, { status: 400 });
            }
        }

        await updateDocument("posts", post.postID, {reports: [...post.reports, reportData], reportStatus: "pending"})


        // LOGIC FOR TEMPORARY BAN
        // Check if the post author has received more than 10 pending or verified reports
        const snapshot = await firestore.collection('posts').where("authorID", "==", post.authorID).where("reportStatus", "in", ["pending", "verified"]).get();
        const authorReports = snapshot.docs.map(doc => doc.data());

        const totalReports = authorReports.reduce((count, post) => {
            const reports = post.reports;
            return count + reports.length;
        }, 0);

        if (totalReports > 10) {
            // Do something if the post author has received more than 10 reports
            try {
                const banUntil = new Date();
                banUntil.setDate(banUntil.getDate() + 3); // Add 3 days to the current date

                await updateDocument("users", post.authorID, { ban: { status: "temporary", until: banUntil } });
            } catch (err) {
                // Handle the error if the user document update fails
                console.error("Error updating user document:", err);
            }
        } 

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
    const { action, id, status} = body;
    try {
        if (action == "update-status") {
            // Use the updateDocument function from firestore-crud.js
            await updateDocument("posts", id, {
                reportStatus: status
            });

            return NextResponse.json({message: 'update success'}, {status: 200});
        } else if (action == "delete-report") {
            // Use the updateDocument function from firestore-crud.js
            await updateDocument("posts", id, {
                reportStatus: "pending",
                reports: []
            });

            return NextResponse.json({message: 'update success'}, {status: 200});
        } else {
            return NextResponse.json({message: 'Invalid action'}, {status: 400});
        }
        
        
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}