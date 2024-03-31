"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { auth, firestore } from "@/lib/firebase";
import { getAllDocuments } from "@/lib/firestore-crud";
import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import NavBar from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import {
	Card
} from "@/components/ui/card";
import { CreatePost } from "@/components/post-components/create-post";
import { PostSnippet } from "@/components/post-components/post-snippet";
import { RepostSnippet } from "@/components/post-components/repost-snippet";

function HomePage() {
	const [userData, setUserData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState([]);
	const [userPets, setUserPets] = useState([]);

	const [activeTab, setActiveTab] = useState("Lost Pets");
	const urlParams = useParams();

	useEffect(() => {
		setLoading(true);
		/**
		 * Subscribes to authentication state changes.
		 * @type {function}
		 */
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			if (user) {
				// User is signed in
				// Fetch signed-in user's data
				try {
					/**
					 * Fetches the data for the currently signed-in user.
					 * @param {string} userId - The ID of the signed-in user.
					 * @returns {Promise<object>} The user data.
					 */
					const fetchCurrentUser = async (userId) => {
						const response = await fetch(
							`/api/users/via-id?id=${userId}`,
							{
								method: "GET",
							}
						);
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
					console.error("Error fetching current user data:", error);
				} finally {
					setLoading(false);
				}
			} else {
				// User is signed out
				setLoading(false);
			}
		});

		return unsubscribe; // Clean-up function for the observer
	}, []);

	/**
     * This useEffect hook is responsible for fetching and updating the data of the current user.
     * It subscribes to changes in the current user's data in the Firestore database and updates the current user's data on the page accordingly.
     * The cleanup function is returned to unsubscribe from the Firestore listener when the component unmounts.
     * This is for the viewer of the page.
     */
	useEffect(() => {
			let unsubscribe;
	
			if (currentUser) { // info of the current user
					const userRef = firestore.collection('users').doc(currentUser.uid);
					// Whenever the user's data in the database changes, update the user's data on the page
					unsubscribe = userRef.onSnapshot((doc) => {
							const newData = doc.data();
							// Prevent infinite loop by setting data only when there is a difference
							if (JSON.stringify(newData) !== JSON.stringify(currentUser)) {
									setCurrentUser(newData);
							}
					});
			} 
	
			return () => unsubscribe; // Cleanup function
	}, [currentUser]);

	// /**
	//  * This useEffect hook is responsible for fetching and updating the pets of the user whose profile is being viewed.
	//  * It fetches the pets of the user from the Firestore database and updates the user's pets on the page accordingly.
	//  *
	//  */
	useEffect(() => {
		// Fetch user pets
		if (currentUser) {
			const fetchUserPets = async () => {
				const response = await fetch(
					`/api/pets/retrieve-user-pets?uid=${currentUser.uid}`,
					{
						method: "GET", // Specify GET method
					}
				);

				if (response.ok) {
					const data = await response.json();
					setUserPets(data.userPets);
				} else {
					// Assuming the API returns { message: '...' } on error
					const errorData = await response.json();
					throw new Error(errorData.message);
				}
			};

			fetchUserPets();
		}
	}, [currentUser]);

    const [ lostPets, setLostPets ] = useState([]);
    const [ lostPetsLoaded, setLostPetsLoaded ] = useState(false);
    const [ lostPetsLastVisible, setLostPetsLastVisible ] = useState(null);

    const [ unknownOwnerPets, setUnknownOwnerPets ] = useState([]);
    const [ unknownOwnerPetsLoaded, setUnknownOwnerPetsLoaded ] = useState(false);
    const [ unknownOwnerPetsLastVisible, setUnknownOwnerPetsLastVisible ] = useState(null);

    const [ foundPets, setFoundPets ] = useState([]);
    const [ foundPetsLoaded, setFoundPetsLoaded ] = useState(false);
    const [ foundPetsLastVisible, setFoundPetsLastVisible ] = useState(null);

	const [loadingPosts, setLoadingPosts] = useState(false);

	// Initial fetch all posts and following posts
	useEffect(() => {
		setLoading(true);
		if (currentUser) {
			const fetchData = async () => {
				
                // fetch all lost pets
                const lostPetsQuery = await firestore.collection('posts')
                .where('category', '==', 'Lost Pets')
                .orderBy('date', 'desc')
                .limit(5)
                .get();

                const lostPetsResults = lostPetsQuery.docs.map(doc => doc.data());
                setLostPetsLastVisible(lostPetsQuery.docs[lostPetsQuery.docs.length - 1]);
                setLostPets(lostPetsResults);

                // fetch all unknown owner pets
                const unknownOwnerPetsQuery = await firestore.collection('posts')
                .where('category', '==', 'Unknown Owner')
                .orderBy('date', 'desc')
                .limit(5)
                .get();

                const unknownOwnerPetsResults = unknownOwnerPetsQuery.docs.map(doc => doc.data());
                setUnknownOwnerPetsLastVisible(unknownOwnerPetsQuery.docs[unknownOwnerPetsQuery.docs.length - 1]);
                setUnknownOwnerPets(unknownOwnerPetsResults);

                // fetch all found pets
                const foundPetsQuery = await firestore.collection('posts')
                .where('category', '==', 'Found Pets')
                .orderBy('date', 'desc')
                .limit(5)
                .get();

                const foundPetsResults = foundPetsQuery.docs.map(doc => doc.data());
                setFoundPetsLastVisible(foundPetsQuery.docs[foundPetsQuery.docs.length - 1]);
                setFoundPets(foundPetsResults);

				setLoading(false);
			};

			fetchData();
		}
	}, [currentUser]);

    const fetchMoreLostPets = async () => {
        setLoadingPosts(true);
        const nextQuery = await firestore.collection('posts')
        .where('category', '==', 'Lost Pets')
        .orderBy('date', 'desc')
        .startAfter(lostPetsLastVisible)
        .limit(5)
        .get();

        const newLostPets = nextQuery.docs.map(doc => doc.data());
        const newLostPetsLastVisible = nextQuery.docs[nextQuery.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newLostPets.length === 0) {
            setLostPetsLoaded(true);
        } else {
            setLostPetsLastVisible(newLostPetsLastVisible);
            setLostPets(prevLostPets => [...prevLostPets, ...newLostPets]);
            setLostPetsLoaded(false);
        }

        setLoadingPosts(false);
    }

    const refreshLostPets = async () => {
        setLoadingPosts(true);
        const refreshQuery = await firestore.collection('posts')
        .where('category', '==', 'Lost Pets')
        .orderBy('date', 'desc')
        .limit(5)
        .get();

        const refreshedLostPets = refreshQuery.docs.map(doc => doc.data());
        setLostPets(refreshedLostPets);
        setLostPetsLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1]);
        setLostPetsLoaded(false);
        setLoadingPosts(false);
    }

    const fetchMoreUnknownOwnerPets = async () => {
        setLoadingPosts(true);
        const nextQuery = await firestore.collection('posts')
        .where('category', '==', 'Unknown Owner')
        .orderBy('date', 'desc')
        .startAfter(unknownOwnerPetsLastVisible)
        .limit(5)
        .get();

        const newUnknownOwnerPets = nextQuery.docs.map(doc => doc.data());
        const newUnknownOwnerPetsLastVisible = nextQuery.docs[nextQuery.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newUnknownOwnerPets.length === 0) {
            setUnknownOwnerPetsLoaded(true);
        } else {
            setUnknownOwnerPetsLastVisible(newUnknownOwnerPetsLastVisible);
            setUnknownOwnerPets(prevUnknownOwnerPets => [...prevUnknownOwnerPets, ...newUnknownOwnerPets]);
            setUnknownOwnerPetsLoaded(false);
        }

        setLoadingPosts(false);
    }

    const refreshUnknownOwnerPets = async () => {
        setLoadingPosts(true);
        const refreshQuery = await firestore.collection('posts')
        .where('category', '==', 'Unknown Owner')
        .orderBy('date', 'desc')
        .limit(5)
        .get();

        const refreshedUnknownOwnerPets = refreshQuery.docs.map(doc => doc.data());
        setUnknownOwnerPets(refreshedUnknownOwnerPets);
        setUnknownOwnerPetsLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1]);
        setUnknownOwnerPetsLoaded(false);
        setLoadingPosts(false);
    }

    const fetchMoreFoundPets = async () => {
        setLoadingPosts(true);
        const nextQuery = await firestore.collection('posts')
        .where('category', '==', 'Found Pets')
        .orderBy('date', 'desc')
        .startAfter(foundPetsLastVisible)
        .limit(5)
        .get();

        const newFoundPets = nextQuery.docs.map(doc => doc.data());
        const newFoundPetsLastVisible = nextQuery.docs[nextQuery.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newFoundPets.length === 0) {
            setFoundPetsLoaded(true);
        } else {
            setFoundPetsLastVisible(newFoundPetsLastVisible);
            setFoundPets(prevFoundPets => [...prevFoundPets, ...newFoundPets]);
            setFoundPetsLoaded(false);
        }

        setLoadingPosts(false);
    }

    const refreshFoundPets = async () => {
        setLoadingPosts(true);
        const refreshQuery = await firestore.collection('posts')
        .where('category', '==', 'Found Pets')
        .orderBy('date', 'desc')
        .limit(5)
        .get();

        const refreshedFoundPets = refreshQuery.docs.map(doc => doc.data());
        setFoundPets(refreshedFoundPets);
        setFoundPetsLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1]);
        setFoundPetsLoaded(false);
        setLoadingPosts(false);
    }

	return (
		<>
			{loading ? (
				<Loader show={true} />
			) : (
				currentUser && (
					<div className="flex">
						{/* Side Navbar */}
						<div className="min-h-16 w-full z-50 fixed">
							<NavBar
								props={{
									uid: currentUser.uid,
									username: currentUser.username,
									userPhotoURL: currentUser.userPhotoURL,
									expand_lock: true,
								}}
							/>
						</div>

						<div className="w-full h-full z-10 mt-16 flex items-center flex-col">
							{/* Tabs */}
							<div className="mt-6 mb-6 flex flex-row font-bold w-full lg:max-w-[650px] md:mr-20 md:ml-20 h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm gap-1">
								<div
									className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${
										activeTab == "Lost Pets"
											? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black"
											: "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"
									}`}
									onClick={() => setActiveTab("Lost Pets")}
								>
									Lost Pets
								</div>

								<div
									className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${
										activeTab == "Unknown Owners"
											? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black"
											: "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"
									}`}
									onClick={() => setActiveTab("Unknown Owners")}
								>
									Unknown Owners
								</div>

                                <div
                                    className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${
                                        activeTab == "Found Pets"
                                            ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black"
                                            : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"
                                    }`}
                                    onClick={() => setActiveTab("Found Pets")}
                                >
                                    Found Pets
                                </div>
							</div>

							<div className="w-full lg:max-w-[650px] md:px-20 lg:px-0">

								{/* Create Post */}
								{currentUser && (
									<Card className="drop-shadow-md rounded-sm mb-6">
										<div className="flex flex-row items-center w-full my-2">
											<div className="ml-4">
												<Image
													src={currentUser.userPhotoURL == "" ? "/images/profilePictureHolder.jpg" : currentUser.userPhotoURL}
													alt="user photo"
													width={44}
													height={44}
													className="rounded-full aspect-square object-cover"
												/>
											</div>
											<div className="w-full mr-4">
												<CreatePost
													props={{
														uid: currentUser.uid,
														username: currentUser.username,
														displayname: currentUser.displayName,
														userphoto: currentUser.userPhotoURL,
														pets: userPets,
													}}
												/>
											</div>
										</div>
									</Card>
								)}

								{ activeTab == "Lost Pets" ? (
									<>
										<div className="flex flex-col w-full items-center justify-center gap-6">
											{lostPets.map((post) => {
												return post.postType ==
													"Original" ? (
													<PostSnippet
														key={post.postID}
														post={post}
														currentUser={currentUser}
													/>
												) : post.postType ==
												  "Repost" ? (
													<RepostSnippet
														key={post.postID}
														post={post}
														currentUser={currentUser}
													/>
												) : <div className="">No lost pets...</div>;
											})}

											{lostPetsLoaded ? (
												<Button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={refreshLostPets}
												>
												Refresh Posts
												</Button>
											) : (
												<Button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={fetchMoreLostPets}
												disabled={loadingPosts}
												>
												Load More
												</Button>
											)}

											{loadingPosts && <div className="mb-20 flex items-center justify-center">Loading...</div>}
										</div>
									</>
								) : activeTab == "Unknown Owners" ? (
									<>
										<div className="flex flex-col min-w-full items-center justify-center gap-6">

											{unknownOwnerPets.map((post) => {
												return post.postType ==
													"Original" ? (
													<PostSnippet
														key={post.postID}
														post={post}
														currentUser={currentUser}
													/>
												) : post.postType ==
												  "Repost" ? (
													<RepostSnippet
														key={post.postID}
														post={post}
														currentUser={currentUser}
													/>
												) : null;
											})}

											{unknownOwnerPetsLoaded ? (
												<button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={refreshUnknownOwnerPets}
												>
												Refresh Posts
												</button>
											) : (
												<button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={fetchMoreUnknownOwnerPets}
												disabled={loadingPosts}
												>
												Load More
												</button>
											)}

											{loadingPosts && <div className="mb-20 flex items-center justify-center">Loading...</div>}
										</div>
									</>
								) : activeTab == "Found Pets" ? (
                                    <>
                                        <div className="flex flex-col min-w-full items-center justify-center gap-6">

                                            {foundPets.map((post) => {
                                                return post.postType ==
                                                    "Original" ? (
                                                    <PostSnippet
                                                        key={post.postID}
                                                        post={post}
                                                        currentUser={currentUser}
                                                    />
                                                ) : post.postType ==
                                                  "Repost" ? (
                                                    <RepostSnippet
                                                        key={post.postID}
                                                        post={post}
                                                        currentUser={currentUser}
                                                    />
                                                ) : null;
                                            })}

                                            {foundPetsLoaded ? (
                                                <button
                                                className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
                                                onClick={refreshFoundPets}
                                                >
                                                Refresh Posts
                                                </button>
                                            ) : (
                                                <button
                                                className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
                                                onClick={fetchMoreFoundPets}
                                                disabled={loadingPosts}
                                                >
                                                Load More
                                                </button>
                                            )}

                                            {loadingPosts && <div className="mb-20 flex items-center justify-center">Loading...</div>}
                                        </div>
                                    </>
                                ) : null}
							</div>
						</div>
					</div>
				)
			)}
		</>
	);
}

export default WithAuth(HomePage);