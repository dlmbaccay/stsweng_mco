"use client";

import { ModeToggle } from "@/components/mode-toggle";

import React, { useEffect, useState } from "react";
// import { useUserData } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { getAuth } from '@/lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function Home() {

  const [ loading, setLoading ] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);

      setTimeout(() => {
        if (user) {
          toast.success("Welcome back! 👋");
          router.push(`/profiles/user/${user.uid}`)
        } else {
          router.push("/auth/landing")
        }
      }, 1500);
    })
    
    return () => unsubscribe();
  }, []);

  return (
    <>
      { loading ? <Loader show={true} /> : null }
    </>
  );
}
