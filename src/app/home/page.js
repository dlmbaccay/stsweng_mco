"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { auth, firestore} from "@/lib/firebase";
import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";
import Loader from "@/components/Loader";
import NavBar from "@/components/nav/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { CreatePost } from "@/components/post-components/create-post";
import { PostSnippet } from "@/components/post-components/post-snippet";
import { RepostSnippet } from "@/components/post-components/repost-snippet";

import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    startAfter,
    getDocs,
    where,
  } from "firebase/firestore";

function HomePage() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ currentUser, setCurrentUser ] = useState([]);

    const [ activeTab, setActiveTab ] = useState('posts');
    const [ userPosts, setUserPosts ] = useState([]);
    const urlParams = useParams();

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
                            method: 'GET'
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
                } finally { 
                    setLoading(false);
                }
            } else { // User is signed out
                setLoading(false);
            }
        });
    
        return unsubscribe; // Clean-up function for the observer
    }, []);

    useEffect(() => {
        // get current user using auth and firestore
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            firestore.collection('users').doc(user.uid).get().then((doc) => {
              if (doc.exists) {
                setCurrentUser(doc.data());
              } else {
                console.log('No such document!');
              }
            }).catch((error) => {
              console.log('Error getting document:', error);
            });
          } else {
            setCurrentUser(null);
          }
        });
    
        return () => {
          unsubscribe();
        }
      }, []);

    const [ fetchedFollowing, setFetchedFollowing ] = useState([]);
    const [ fetchedPosts, setFetchedPosts ] = useState([]);

    const [allPosts, setAllPosts] = useState([]);
    const [allPostsLoaded, setAllPostsLoaded] = useState(false);
    const [allPostsLastVisible, setAllPostsLastVisible] = useState(null);

    const [following, setFollowing] = useState([]); 
    const [followingPosts, setFollowingPosts] = useState([]);
    const [followingPostsLoaded, setFollowingPostsLoaded] = useState(false);
    const [followingLastVisible, setFollowingLastVisible] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchPosts = async () => {
            const allPosts = [];
            const following = [];
      
            // fetch all posts
            const allPostsQuery = query(
              collection(firestore, 'posts')
            );
            const allPostsSnapshot = await getDocs(allPostsQuery);
            allPostsSnapshot.forEach((doc) => {
              allPosts.push(doc.data());
            });
      
            // fetch following posts
            const followingQuery = query(
              collection(firestore, 'posts')
            //   , 
            //   where('petIDs', 'array-contains', urlParams.petID),
            //   where('category', '==', 'Milestones')
            );
            const followingSnapshot = await getDocs(followingQuery);
            followingSnapshot.forEach((doc) => {
              following.push(doc.data());
            });
      
            setFetchedPosts(allPosts);
            setFetchedFollowing(following);
          }
      
        //   fetchData();
          fetchPosts();

    }, []);

  return (
    <>
      { loading ? <Loader show={true} /> : (currentUser && 
          <div className="flex justify-center h-screen">
              {/* Side Navbar */}
              <div className="min-h-16 w-full z-50 fixed">
                  <NavBar props={{
                      uid : currentUser.uid,
                      username: currentUser.username, 
                      userPhotoURL: currentUser.userPhotoURL,
                      expand_lock: true,
                  }}/>
              </div>

              <div className="w-1/2 h-full z-10 mt-16 flex justify-center flex-col">
                
                {/* Tabs */}
                <div className="mt-6 mb-6 flex flex-row font-bold w-1/2 h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm gap-1">
                    <div
                        className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${activeTab == 'posts' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                        onClick={() => setActiveTab('For You')}
                    >
                        For You
                    </div>

                    <div
                        className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${activeTab == 'pets' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                        onClick={() => setActiveTab('Following')}
                    >
                        Following
                    </div>
                </div>

                {/* Create Post */}
                <div className="">
                    { currentUser.uid === userData.uid ? 
                        <Card className="drop-shadow-md rounded-sm mb-6">
                            <div className="flex flex-row items-center w-full my-2">
                                <div className="ml-4">
                                    <Image src={userData.userPhotoURL == "" ? "/images/profilePictureHolder.jpg" : userData.userPhotoURL} alt="user photo" width={44} height={44} className="rounded-full aspect-square object-cover" />
                                </div>
                                <div className="w-full mr-4">
                                    <CreatePost props={{
                                        uid: userData.uid,
                                        username: userData.username,
                                        displayname: userData.displayName,
                                        userphoto: userData.userPhotoURL,
                                        pets: userPets,
                                    }}/>
                                </div>
                            </div>
                        </Card> : null
                    }

                    {activeTab == 'For You' ? (
                        <>
                            <div className="flex flex-col min-w-full items-center justify-center gap-6">
                                {fetchedPosts.map((post) => {
                                    return (
                                        (post.postType == 'Original' ?
                                            <PostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                        
                                        : post.postType == 'Repost' ?
                                            <RepostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                        : null)
                                    )
                                })}
                            </div>
                        </>
                    ): (
                        <>
                            <div className="flex flex-col min-w-full items-center justify-center gap-6">
                                {fetchedPosts.map((post) => {
                                    return (
                                        (post.postType == 'Original' ?
                                            <PostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                        
                                        : post.postType == 'Repost' ?
                                            <RepostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                        : null)
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
              </div>
          </div>
      )}
    </>
  )
}

export default WithAuth(HomePage);