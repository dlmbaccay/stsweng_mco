// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { uploadUserProfilePhoto} from '@/lib/storage-funcs';
import { createUserDocument, isUsernameTaken, updateDocument } from '@/lib/firestore-crud';


export async function POST(request) {
    const formData = await request.formData();
    console.log(formData)
    const file = formData.get("file");
    if (!file) {
        return NextResponse.json({ error: "No files received." }, { status: 400 });
    }
    const user = formData.get("user");
    return new Promise(async (resolve, reject) => {
        try {
            const photoURL = await uploadUserProfilePhoto(user, file);
            resolve(NextResponse.json({ url: photoURL }), {status: 200});
        } catch (error) {
            console.log('Error in API Route:', error);
            reject(NextResponse.json({ error: error.message }, {status: 500}));
        }
    });
}
