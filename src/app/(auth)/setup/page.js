"use client"

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/lib/firebase";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import WithAuth from "@/components/WithAuth";


function SetupPage() {

  const router = useRouter();
  const user = useAuthState(auth);

  const handleSignOut = () => {
    auth.signOut()
    .then(() => {
      router.push('/landing');
      toast.success('Signed out');
      console.log('Signed out');
    })
  }
  
    const [usernameFormValue, setUsernameFormValue] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkUserSetup = async () => {
            if (user) {
                const userRef = firestore.doc(`users/${user.uid}`);
                const doc = await userRef.get();
                if (doc.exists && doc.data().username) {
                    toast.error("You've already set up your account!");
                    router.push(`/Home`);
                }
            }
        };
        checkUserSetup();
    }, [user, router]);

    const handleUsernameChange = (event) => {
        const username = event.target.value.toLowerCase().trim();
        setUsernameFormValue(username);
    };

    const handleDisplayNameChange = (event) => {
        const displayName = event.target.value.trim();
        setDisplayName(displayName);
    };

    const handleFileSelect = (event) => {
      const displayName = event.target.value.trim();
      setDisplayName(displayName);
  };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Your form submission logic here
    };


  return (
    <div>
      Profile Setup Page
      <ModeToggle></ModeToggle>
      <button onClick={handleSignOut}>Sign Out</button>
      <div className="bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] h-screen  justify-center items-center flex">
        <form onSubmit={handleSubmit} className="bg-snow rounded-md p-8 pb-5 w-full md:w-[1000px] h-full md:h-fit flex flex-col overflow-y-scroll md:overflow-hidden">
            <h1 className="font-shining text-xl">Let's create your BantayBuddy account!</h1>
            
            {/* Username */}
            <div className="w-full mt-4">
                <label htmlFor="username" className="block text-sm font-medium text-raisin_black">
                    <span>Username</span>
                    <span className="text-red-500"> *</span>
                </label>
                <Input type="text" id="username" value={usernameFormValue} className={`outline-none mt-2 p-2 border rounded-md w-full`} placeholder="Enter your username" required 
                    maxLength={15}
                    minLength={3}
                    onChange={handleUsernameChange} />
            </div>
            
            {/* Display Name */}
            <div className="w-full mt-4">
                <label htmlFor="display-name" className="block text-sm font-medium text-raisin_black">
                    <span>Display Name</span>
                    <span className="text-red-500"> *</span>
                </label>
                <Input type="text" id="display-name" value={displayName} className={`outline-none mt-2 p-2 border rounded-md w-full`} placeholder="What would you like us to call you?" required
                    maxLength={30}
                    minLength={1}
                    onChange={handleDisplayNameChange} />
            </div>

            {/* profile picture */}
            {/* <div className="w-full">
              <label className="flex gap-2 items-center text-sm font-medium text-gray-700">
                  Profile Picture
                  <span className="text-raisin_black text-xs">(JPG, PNG, or GIF).</span>
              </label>
              <div className="mt-2 w-full">
                  <input type="file"  onChange={handleFileSelect} accept="image/x-png,image/gif,image/jpeg" className='text-sm mb-4'/>
                  {!previewUrl && (
                      <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                          <Image src={'/images/profilePictureHolder.jpg'} alt="Profile Picture" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                      </div>
                  )}

                  {previewUrl && (
                      <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                          <Image src={previewUrl} alt="Preview" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                      </div>
                  )}
              </div>
          </div> */}

          <div className='flex flex-col w-full'>
              {/* about */}
              <div className="w-full mb-1">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                  <textarea id='about' className="mt-2 p-2 border rounded-md w-full resize-none" rows="3" maxLength="100" placeholder="Tell us about yourself..." />
              </div>

              {/* gender */}
              <div className="w-full mb-4">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      <span>Gender</span>
                      <span className="text-red-500"> *</span>
                  </label>
                  <select id="genderSelect" name="gender" className="mt-1 p-2 text-md border rounded-md w-full" required>
                      <option value="None">Prefer Not to Say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                  </select>
              </div>

              {/* birthdate */}
              <div className="w-full mb-4">
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                      <span>Birthdate</span>
                      <span className="text-red-500"> *</span>
                  </label>
                  <input type="date" id="birthdate" name="birthdate" className="mt-1 p-2 border text-md rounded-md w-full" max="9999-12-31" required/>
              </div>
          </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-4 mt-6">
                <Button onClick={handleSignOut} colorScheme="black" variant="solid">
                    Sign Out
                </Button>
                <Button type='submit' colorScheme="xanthous" variant="solid">
                    Submit
                </Button>
            </div>
        </form>
      </div>
    </div>
  )
}


export default WithAuth(SetupPage);