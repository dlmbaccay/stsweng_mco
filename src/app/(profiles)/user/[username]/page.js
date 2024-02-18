"use client"

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getDocumentByFieldValue } from "@/lib/crud";
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
          const data = await getDocumentByFieldValue('users', 'username', urlParams.username);
          setUserData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
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

          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) }
    </>
  )
}
