import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { updateDocument, getDocumentsWithCondition, createReportDocument, hasReported} from '@/lib/firestore-crud'; 
import { checkIfBannable } from '@/lib/helper-functions';
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

                await updateDocument("posts", post.postID, { reports: post.reports});
                return NextResponse.json({ message: "Report success." }, { status: 200 });
            } else {
                return NextResponse.json({ message: "You have already reported this post." }, { status: 400 });
            }
        }

        await updateDocument("posts", post.postID, {reports: [...post.reports, reportData], reportStatus: post.reportStatus ? post.reportStatus : "pending"});


        // LOGIC FOR BAN
        // Check if the post author has received reports in multiple posts
        const snapshot = await firestore.collection('posts').where("authorID", "==", post.authorID).where("reportStatus", "in", ["pending", "verified"]).get();
        const authorReports = snapshot.docs.map(doc => doc.data());

        const totalReports = authorReports.reduce((count, post) => {
            const reports = post.reports;
            return count + reports.length;
        }, 0);

        if (totalReports >= 10) {
            // Do something if the post author has received more than 10 reports
            try {
                const banUntil = new Date();
                banUntil.setDate(banUntil.getDate() + 3); // Add 3 days to the current date

                await updateDocument("users", post.authorID, { ban: { status: "temporary", until: banUntil } });

                // Create a notification for admin
                const notifData = {
                    type: "ban",
                    userID: post.authorID,
                    username: post.authorUsername,
                    userPhotoURL: post.authorPhotoURL,
                    desc: "temporarily banned due to excessive reports",
                    banStatus: "temporary",
                    until: banUntil,
                    createdAt: new Date()
                }

                const adminDocRef = firestore.collection('admin').doc("5QMdCpbNvBMBSJ0wY9i28adWdx72");
                await adminDocRef.collection('notifications').add(notifData);
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
    const { action, id, author, status} = body;
    try {
        if (action == "update-status") {
            // Use the updateDocument function from firestore-crud.js
            await updateDocument("posts", id, {
                reportStatus: status
            });

            const reposts = await firestore.collection('posts').where('originalPostID', '==', id).get();

            if (status === "verified") {
                const repostDocs = reposts.docs.map(doc => doc.data());
                if (repostDocs.length > 0) {
                    repostDocs.forEach(async (repost) => {
                        await updateDocument("posts", repost.postID, {
                            originalReportStatus: "verified"
                        });
                    });
                }
            }

            if (status === "dismissed" || status === "pending") {
                const repostDocs = reposts.docs.map(doc => doc.data());
                if (repostDocs.length > 0) {
                    repostDocs.forEach(async (repost) => {
                        await updateDocument("posts", repost.postID, {
                            originalReportStatus: status
                        });
                    });
                }
            }

            // Check if user should be permanently banned, if yes then permanently ban.
            await checkIfBannable(author);

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