"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function SetupPage() {

  const router = useRouter();

  const handleSignOut = () => {
    auth.signOut()
    .then(() => {
      router.push('/landing');
      toast.success('Signed out');
      console.log('Signed out');
    })
  }

  return (
    <div>
      Profile Setup Page
      <ModeToggle></ModeToggle>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}