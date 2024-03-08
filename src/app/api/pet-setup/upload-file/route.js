// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { uploadPetProfilePhoto } from '@/lib/storage-funcs';

export async function POST(request) {
    const formData = await request.formData();
    console.log(formData)

    const action = formData.get("action");
    const pet = formData.get("pet");
    const file = formData.get("file");

    if (!file) {
        return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    return new Promise(async (resolve, reject) => {
        switch (action) {
            case "uploadPetProfile":
                try {
                    const photoURL = await uploadPetProfilePhoto(pet, file);
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