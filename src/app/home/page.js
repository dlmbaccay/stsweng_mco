"use client"

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";
import Loader from "@/components/Loader";
import NavBar from "@/components/nav/navbar";

function HomePage() {
    const [loading, setLoading] = useState(true);
    const [ currentUser, setCurrentUser ] = useState([]);

    useEffect(() => {
        setLoading(true); 
        /**
         * Subscribes to authentication state changes.
         * @type {function}
         */
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) { // User is signed in
                // Fetch signed-in user's data
                try {
                    /**
                     * Fetches the data for the currently signed-in user.
                     * @param {string} userId - The ID of the signed-in user.
                     * @returns {Promise<object>} The user data.
                     */
                    const fetchCurrentUser = async (userId) => {
                        const response = await fetch(`/api/users/via-id?id=${userId}`, {
                            method: 'GET' // Specify GET method
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setCurrentUser(data);
                        } else {
                            // Assuming the API returns { message: '...' } on error
                            const errorData = await response.json();
                            throw new Error(errorData.message);
                        }
                    };

                    await fetchCurrentUser(user.uid);
                } catch (error) {
                    console.error('Error fetching current user data:', error);
                } finally { // Add a 'finally' block
                    setLoading(false);
                }
            } else {
                // Handle the case when no user is signed in (optional)
                setLoading(false);
            }
        });
    
        return unsubscribe; // Clean-up function for the observer
    }, []);

  return (
    <>
      { loading ? <Loader show={true} /> : (currentUser && 
          <div className="flex">
              {/* Side Navbar */}
              <div className="min-h-16 w-full z-50 fixed">
                  <NavBar props={{
                      uid : currentUser.uid,
                      username: currentUser.username, 
                      userPhotoURL: currentUser.userPhotoURL,
                      expand_lock: true,
                  }}/>
              </div>
              <div className="w-full h-screen fixed z-10 mt-16">
                Home Page
              </div>
          </div>
      )}
    </>
  )
}

export default WithAuth(HomePage);