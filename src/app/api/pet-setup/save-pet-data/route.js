// // app/user-actions/route.js
// import { NextResponse } from 'next/server';
// import { createPetDocument } from '@/lib/firestore-crud';

// export async function POST(request) {
//     const body = await request.json();
//     const petData = body.data;
//     try {
//         const petId = await createPetDocument('pets', petData);
//         return NextResponse.json({ petId }, {status: 200});
        
//     } catch (error) {
//         console.log('Error in API Route:', error);
//         return NextResponse.json({ error: error.message }, {status: 500});
//     }
// }
