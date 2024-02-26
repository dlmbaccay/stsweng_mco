// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { uploadUserProfilePhoto, uploadUserCoverPhoto} from '@/lib/storage-funcs';
import { createUserDocument, isUsernameTaken, updateDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const formData = await request.formData();
    console.log(formData)
    const action = formData.get("action");
    const file = formData.get("file");
    if (!file) {
        return NextResponse.json({ error: "No files received." }, { status: 400 });
    }
    const user = formData.get("user");
    return new Promise(async (resolve, reject) => {
        switch (action) {
            case "uploadProfile":
                try {
                    const photoURL = await uploadUserProfilePhoto(user, file);
                    resolve(NextResponse.json({ url: photoURL }), {status: 200});
                } catch (error) {
                    console.log('Error in API Route:', error);
                    reject(NextResponse.json({ error: error.message }, {status: 500}));
                }
                break;
            case "uploadCover":
                // Handle create user action
                try {
                    const photoURL = await uploadUserCoverPhoto(user, file);
                    resolve(NextResponse.json({ url: photoURL }), {status: 200});
                } catch (error) {
                    console.log('Error in API Route:', error);
                    reject(NextResponse.json({ error: error.message }, {status: 500}));
                }
                break;
            default:
                reject(NextResponse.json({ error: "Invalid action." }, {status: 400}));
                break;
        }
    });
}