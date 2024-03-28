"use client"
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BanPage() {
    const router = useRouter();
    const [ userBan, setUserBan] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) { // User is not signed in
                router.push("/landing")
            } else {
                try {
                    const userDoc = await firestore.collection('users').doc(user.uid).get();
                    setUserBan(userDoc.data().ban);
                } catch (error) {
                    console.log('Error fetching user ban status:', error);
                }
            }
        });
    
        return unsubscribe; // Clean-up function for the observer
    }, []);

    const handleSignOut = async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            router.push('/landing');
        } catch (error) {
            console.log('Error signing out:', error);
        }
    };

    return (
        <div class="flex lg:flex-row max-sm:flex-col h-screen px-4 bg-snow justify-center items-center lg:gap-10 max-sm:gap-0">
        <Image src='/images/error.png' alt='error' width={300} height={300} className='max-sm:h-72 max-sm:w-auto'/>
        <div className='mt-20 max-sm:text-center max-sm:mt-3'>
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Oh no! You have been {userBan.status === "temporary" ? "Temporarily" : "Permanently"} Banned!</p>
            <p className="mt-4 max-sm:mt-2 text-raisin_black text">You have violated our guidelines and policies.</p>
            <p className="mt-4 max-sm:mt-2 text-raisin_black text">You will not be able to access your account {userBan.status === "temporary" ? "until "+userBan.until : "INDEFINITELY"}.</p>
            <button type='button' className="w-fit px-5 py-3 mt-6 max-sm:mt-3 text-shining text-sm font-medium bg-primary text-secondary-foreground rounded-md hover:scale-110 transition-all focus:outline-none focus:ring"
                    onClick={(e) => handleSignOut(e)}>Sign Out</button>
        </div>
            
        </div>
  )
}