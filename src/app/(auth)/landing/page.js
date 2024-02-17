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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
   * handleSignIn function
   * 
   * @param {string} email - The email of the user
   * @param {string} password - The password of the user
   * 
   * This function handles the sign in process of an existing
   * user. It takes an email and password as arguments 
   * which are then passed through Firebase's 
   * signInWithEmailAndPassword method to authenticate the user.
   * 
   * If the authentication is successful, the user is redirected
   * to the home page. If an error occurs, a toast message is displayed.
   */  
  const handleSignIn = async () => {
    if (email === '' || password === '') {
      toast.error('Enter your email and password.');
      return;
    } else {
      toast.loading('Signing in...');

      auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // sign the user in
        const user = userCredential.user;

        // clear fields
        setEmail('');
        setPassword('');
        toast.dismiss();

        // check if user is already verified
        if (user.emailVerified) {          
          toast.success('Signed in successfully!');
          if (userHasNoPriorData) {
            router.push('/setup');
          } else {
            router.push('/home');
          }
        } else {
          toast.error('Account not verified. Please check your email for verification instructions.');
          // Automatic Sign Out for non-verified users
          auth.signOut()
        }
        
        
      }).catch((error) => {
          console.log(error);
          toast.dismiss();
          toast.error('Invalid email or password. Please try again.');
      });
    }
  }

  /**
   * userHasNoPriorData helper function
   * 
   * This function checks if the user has prior data in the database.
   * It performs a query or check in the Firebase database using the userId.
   * If the user has prior data, it returns true; otherwise, it returns false.
   * 
   * @param {string} userId - The ID of the user
   * @returns {boolean} - True if the user has prior data, false otherwise
   */
  const userHasNoPriorData = async (userId) => {
    // Perform a query or check in the Firebase database to determine if the user has prior data
    const userDataSnapshot = await firestore.collection("userData").doc(userId).get();
    return !userDataSnapshot.exists;
  }

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
    try {
        const result = await auth.signInWithPopup(googleAuthProvider);
        const user = result.user;

        toast.success('Signed in with Google');

        // check if user has no prior data
        if (userHasNoPriorData(user.uid)) {
            toast(`Let's set up your account!`, { icon: '👏' });
            router.push('/setup');
        } else {
            setEmail('');
            setPassword('');

            toast('Welcome back', { icon: '👏' });
            router.push('/home');
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error.message);
        console.error(error.message);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">

      <Card className="w-[600px] h-[500px] flex flex-col items-center justify-center outline rounded-3xl drop-shadow-lg">
        
        <CardHeader className="flex flex-row items-center justify-center">
          <p className="font-bold text-2xl">BantayBuddy</p>
          <ModeToggle />
        </CardHeader>
        
        <CardContent className="w-full items-center justify-center flex">
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
                    className="outline rounded-lg drop-shadow-sm"
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
                    className={`outline rounded-lg drop-shadow-sm ${password === '' ? '': !checkPassword(password) ? 'border border-red-500' : 'border border-green-500'}`}
                  />

                  { showPasswordTooltip  && (
                    <>
                      <div className="mt-4 flex flex-row w-full pl-2 gap-4 text-[12px] text-start">
                        <div className="w-2/3">
                          <p className={`${/^.{8,16}$/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>- Be 8-16 characters long.</p>
                          <p className={`${/[A-Z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>- Contain at least one uppercase letter.</p>
                          <p className={`${/[a-z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>- Contain at least one lowercase letter.</p>
                        </div>
                        <div className="w-fit"> 
                          <p className={`${/[0-9]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>- Contain at least one digit.</p>
                          <p className={`${/\W/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>- Contain at least one special character.</p>
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
                    className={`outline rounded-lg drop-shadow-sm
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
                  className="bg-primary text-primary-foreground hover:opacity-80 hover:drop-shadow-md transition-all" 
                >
                  Sign Up
                </Button>

                <Button 
                  onClick={handleGooglePopUp}
                  className="flex gap-1 bg-secondary text-secondary-foreground hover:bg-bsecondary hover:opacity-80 hover:drop-shadow-md transition-all"
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
                    className="outline rounded-lg" 
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
                    className="outline rounded-lg"
                  />
                </div>
              </div>

              {/* buttons */}
              <div className="w-full flex flex-col gap-3">
                <Button
                  onClick={handleSignIn}
                  className="bg-primary text-primary-foreground hover:opacity-80 hover:drop-shadow-md transition-all" 
                >
                  Log In
                </Button>

                <Button 
                  onClick={handleGooglePopUp}
                  className="flex gap-1 bg-secondary text-secondary-foreground hover:bg-bsecondary hover:opacity-80 hover:drop-shadow-md transition-all"
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
        </CardContent>
      </Card>
    </div>
  )
}