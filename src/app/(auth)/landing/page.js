"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, firestore, googleAuthProvider } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { checkPassword } from "@/lib/formats";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function Landing() {

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ confirm_password, setConfirmPassword ] = useState('');
  const [ showPasswordTooltip, setShowPasswordTooltip ] = useState(false);
  const [ showConfirmPasswordTooltip, setShowConfirmPasswordTooltip ] = useState(false);
  const router = useRouter();

  const [ loggingIn, isLoggingIn ] = useState(false);
  const [ signingUp, isSigningUp ] = useState(true); // default for now, but loggingIn will be the default in production

  /**
   * handleSignUp function
   * 
   * @param {string} email - The email of the user
   * @param {string} password - The password of the user
   * 
   * This function handles the sign up process of a new
   * user. It takes an email and password as arguments 
   * which are then passed through Firebase's 
   * createUserWithEmailAndPassword method to create a 
   * new user account.
   * 
   * An email verification is then sent to the user's 
   * email address. If the account is successfully 
   * created, the user is signed out and redirected to 
   * the log in page.
   *
   * If an error occurs, a toast message is displayed.
   */  
  const handleSignUp = async () => {
    if (email === '' || password === '' || confirm_password === '') {
      toast.error('Please fill in all fields.');
      return;
    } else if (!checkPassword(password)) {
      toast.error('Password does not meet requirements.');
      return;
    } else if (password !== confirm_password) {
      toast.error('Passwords do not match.');
      return;
    } else {
      toast.loading('Creating account...');

      auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        
        // sign the user in
        const user = userCredential.user;
        console.log('Created user:', user);

        // clear fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // send email verification
        auth.currentUser.sendEmailVerification()
        .catch((error) => {
          console.log(error)
        });

        // sign the user out
        auth.signOut().then(() => {
          console.log('Signed out created user');
          isSigningUp(false);
          isLoggingIn(true);
        }).catch((error) => {
          console.log(error);
        });
        
        toast.dismiss();
        toast.success('Account created! Please check your email to verify your account.');
      }).catch((error) => {
          console.log(error);
          toast.dismiss();
          toast.error('An error occurred. Please try again.');
      });
    }
  }

  /**
   * handleGooglePopUp function
   * 
   * params: none
   * 
   * This function handles the sign up process of a new
   * user using Google. It uses Firebase's signInWithPopup
   * method to sign up a new user using Google's
   * authentication provider.
   * 
   * If the user is successfully signed up, the user is
   * redirected to the setup page if the user is new, or
   * to the home page if the user is old.
   * 
   * No more email verification is needed as Google
   * already handles this.
   * 
   * If an error occurs, a toast message is displayed.
   * 
   */

  async function handleGooglePopUp() {
    await auth.signInWithPopup(googleAuthProvider).then((result) => {
      // Signed in 
      const user = result.user;
      

      toast.success('Signed in with Google');

      return user;
    }).then((user) => {
      // Fetch the username from Firestore
      const ref = firestore.collection('users').doc(user.uid);

      ref.get().then((doc) => {
        const username = doc.data()?.username;

        if (!username) {
            // If email is verified but no username, redirect to AccountSetup
            toast(`Let's set up your account!`, { icon: '👏' });
            router.push('/setup');
        } else {
          // If old user (email verified and has username), redirect to Home

          // Clear fields
          setEmail('');
          setPassword('');

          toast('Welcome back', { icon: '👏' });
          router.push('/home'); // can only be tested when login and account setup functionality is complete
        }
      }).catch((error) => {
        toast.dismiss();
        toast.error(error.message);
        console.log(error.message);
      });
    }).catch((error) => {
      toast.dismiss();
      toast.error(error.message)
      console.log(error.message)
    })
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">

      <div className="w-[600px] h-[500px] flex flex-col items-center justify-center border outline rounded-3xl gap-6">
        <div className="flex items-center justify-center gap-2">
          <p className="font-bold text-2xl">BantayBuddy</p>
          <ModeToggle />
        </div>
        
        { signingUp ?
          <div className="w-[80%] flex flex-col gap-6">
            
            {/* inputs */}
            <div className="flex flex-col items-center justify-center gap-4">
              
              {/* email */}
              <div className="w-full items-center">
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
              <div className="w-full items-center">
                <Input 
                  type="password" 
                  id="password" 
                  placeholder="Password" 
                  value={password}
                  onFocus={() => setShowPasswordTooltip(true)}
                  onBlur={() => setShowPasswordTooltip(false)}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border outline rounded-lg ${password === '' ? '': !checkPassword(password) ? 'border border-red-500' : 'border border-green-500'}`}
                />

                { showPasswordTooltip  && (
                  <>
                    <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                      <div>
                        <p className={`text-xs ${/^.{8,16}$/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Be 8-16 characters long.</p>
                        <p className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one uppercase letter.</p>
                        <p className={`text-xs ${/[a-z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one lowercase letter.</p>
                      </div>
                      <div>
                        <p className={`text-xs ${/[0-9]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one digit.</p>
                        <p className={`text-xs ${/\W/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>Contain at least one special character.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* confirm password */}
              <div className="w-full items-center">
                <Input 
                  type="password" 
                  id="confirm_password" 
                  placeholder="Confirm Password" 
                  onFocus={() => setShowConfirmPasswordTooltip(true)}
                  onBlur={() => setShowConfirmPasswordTooltip(false)}
                  value={confirm_password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`border outline rounded-lg
                    ${confirm_password === '' ? '' : confirm_password === password ? 'border border-green-500' : 'border border-red-500'}
                  `}
                />

                { 
                  showConfirmPasswordTooltip &&
                  (
                    confirm_password === '' ? null : confirm_password === password ? 
                    <p className="mt-2 pl-2 text-xs text-green-500">Passwords match!</p> : 
                    <p className="mt-2 pl-2 text-xs text-red-500">Passwords do not match.</p>
                  )
                }
              </div>  
            </div>

            {/* buttons */}
            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleSignUp}
              >
                Sign Up
              </Button>

              <Button 
                onClick={handleGooglePopUp}
                className="flex gap-1"
              >
                  <p> Continue with </p>
                  <FcGoogle/>
              </Button>
            </div>

            {/* redirect to log in */}
            <div className="text-sm flex gap-1 w-full items-center justify-center">
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
              <div className="w-full items-center">
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
              <div className="w-full items-center">
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
              <Button
                // onClick={handleLogIn}
              >
                Log In
              </Button>

              <Button 
                // onClick={handleGooglePopUp}
                className="flex gap-1"
               >
                  <p> Continue with </p>
                  <FcGoogle />
              </Button>
            </div>

            {/* redirect to sign up */}
            <div className="text-sm flex gap-1 w-full items-center justify-center">
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