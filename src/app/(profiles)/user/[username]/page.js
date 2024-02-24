"use client"

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getDocumentByFieldValue } from "@/lib/firestore-crud";
import { ModeToggle } from "@/components/mode-toggle";
import  Loader from "@/components/Loader";


export default function UserProfile() {
  const router = useRouter();
  const urlParams = useParams();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function getUserData() {
        if (urlParams.username) {
            try {
                const response = await fetch(`/api/users?username=${urlParams.username}`, {
                    method: 'GET' // Specify GET method
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data); 
                } else {
                    // Assuming the API returns { message: '...' } on error
                    const errorData = await response.json();
                    throw new Error(errorData.message); 
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally { // Add a 'finally' block
                setLoading(false);  
            }
        }
    }
    getUserData();
  }, [urlParams.username]);

  const handleSignOut = () => {
    auth.signOut()
    .then(() => {
      router.push('/landing');
      toast.success('Signed out');
      console.log('Signed out');
    })
  }

  return (
    <>
      { loading ? <Loader show={true} /> : (
        <div>
          User Profile Page
          <ModeToggle></ModeToggle>

          {userData.displayName}
          {userData.uid}
          <img src={userData.userPhotoURL ? userData.userPhotoURL : "/images/profilePictureHolder.jpg"} width={50} height={50}></img>

          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) }
    </>
  )
}
