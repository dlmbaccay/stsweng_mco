"use client"

import { ModeToggle } from "@/components/mode-toggle";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { auth, firestore, googleAuthProvider } from "@/lib/firebase";
import { checkPassword } from "@/lib/formats";

import { Input } from "@/components/ui/input";

import { FcGoogle } from "react-icons/fc";

export default function Landing() {

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ confirm_password, setConfirmPassword ] = useState('');
  const [ showTooltip, setShowTooltip ] = useState(false);
  const router = useRouter();

  const [ loggingIn, isLoggingIn ] = useState(false);
  const [ signingUp, isSigningUp ] = useState(true); // default for now, but loggingIn will be the default in production

  // handleSignUp
  // handleGooglePopUp
  // checkPassword from formats

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">

      <div className="w-[600px] h-[500px] flex flex-col items-center justify-center border outline rounded-3xl gap-6">
        <div className="flex items-center justify-center gap-2">
          <p className="font-bold text-2xl">BantayBuddy</p>
          <ModeToggle />
        </div>
        
        { signingUp ?
          <div className="w-[80%] flex flex-col gap-8">
            {/* inputs */}
            <div className="flex flex-col items-center justify-center gap-4">
              {/* email */}
              <div className="w-full items-center gap-1.5">
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border outline rounded-lg"
                />
              </div>

              {/* password */}
              <div className="w-full items-center gap-1.5">
                <Input 
                  type="password" 
                  id="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border outline rounded-lg"
                />
              </div>

              {/* {showTooltip && (
                <div className="tooltip bg-gray-800 drop-shadow-sm text-white text-xs rounded p-1 absolute -top-20 -right-10 transform translate-x-0 translate-y-0">
                  <p className='text-sm text-slate-200'>Password must:</p>
                  <ul className="list-none pl-2">
                    <li className={`text-xs ${/^.{8,16}$/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Be 8-16 characters long.</li>
                    <li className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one uppercase letter.</li>
                    <li className={`text-xs ${/[a-z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one lowercase letter.</li>
                    <li className={`text-xs ${/[0-9]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one digit.</li>
                    <li className={`text-xs ${/\W/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one special character.</li>
                  </ul>
                </div>
              )} */}

              {/* confirm password */}
              <div className="w-full items-center gap-1.5">
                <Input 
                  type="password" 
                  id="confirm_password" 
                  placeholder="Confirm Password" 
                  value={confirm_password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border outline rounded-lg"
                />
              </div>  
            </div>

            {/* buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                // onClick={handleSignUp}
                className='
                  bg-black text-white 
                  rounded-lg w-full h-10 text-sm
                  hover:bg-white hover:text-black hover:outline transition-all'
              >
                Sign Up
              </button>

              <button 
                // onClick={handleGooglePopUp}
                className='
                  bg-black text-white 
                  rounded-lg w-full h-10 text-center text-sm
                  flex items-center justify-center gap-2 
                  hover:bg-white hover:text-black hover:outline transition-all'
                >
                  <p> Continue with </p>
                  <FcGoogle className="w-150 h-150"/>
              </button>
            </div>

            <div className="flex gap-1 w-full items-center justify-center">
              Already have an account? 
              <button 
                onClick={() => {
                  isSigningUp(false);
                  isLoggingIn(true);
                }}
                className="hover:underline">
                Log In
              </button>
            </div>
          </div> : null
        }

        { loggingIn ? 
          <div className="w-[80%] flex flex-col gap-8">
            {/* inputs */}
            <div className="flex flex-col items-center justify-center gap-4">
              {/* email */}
              <div className="w-full items-center gap-1.5">
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border outline rounded-lg"
                />
              </div>

              {/* password */}
              <div className="w-full items-center gap-1.5">
                <Input 
                  type="password" 
                  id="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border outline rounded-lg"
                />
              </div>
            </div>

            {/* buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                // onClick={handleSignUp}
                className='
                  bg-black text-white 
                  rounded-lg w-full h-10 text-sm
                  hover:bg-white hover:text-black hover:outline transition-all'
              >
                Log In
              </button>

              <button 
                // onClick={handleGooglePopUp}
                className='
                  bg-black text-white 
                  rounded-lg w-full h-10 text-center text-sm
                  flex items-center justify-center gap-2 
                  hover:bg-white hover:text-black hover:outline transition-all'
                >
                  <p> Continue with </p>
                  <FcGoogle className="w-150 h-150"/>
              </button>
            </div>

            <div className="flex gap-1 w-full items-center justify-center">
              Don&apos;t have an account?
              <button 
                onClick={() => {
                  isSigningUp(true);
                  isLoggingIn(false);
                }}
                className="hover:underline">
                Sign Up
              </button> 
            </div>
          </div> : null
        }

      </div>

    </div>
  )
}