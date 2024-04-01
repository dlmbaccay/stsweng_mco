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

	useEffect(() => {
		setLoading(true);

		const unsubscribeAuth = auth.onAuthStateChanged((user) => {
			if (user) {
				console.log("User is signed in.");

				const unsubscribeUser = firestore.collection('users').doc(user.uid).onSnapshot((doc) => {
					const userData = doc.data()
					setCurrentUser(userData);

					console.log('current user: ', userData);

					// fetch lost pets
					const fetchLostPets = async () => {
						const lostPetsQuery = await firestore.collection('posts')
						.where('category', '==', 'Lost Pets')
						.orderBy('date', 'desc')
						.limit(5)
						.get();

						const lostPetsData = lostPetsQuery.docs.map(doc => doc.data());
						setLostPets(lostPetsData);
						setLostPetsLastVisible(lostPetsQuery.docs[lostPetsQuery.docs.length - 1]);

						console.log('lost pets: ', lostPetsData)
					}

					// fetch unknown owner pets
					const fetchUnknownOwnerPets = async () => {
						const unknownOwnerPetsQuery = await firestore.collection('posts')
						.where('category', '==', 'Unknown Owner')
						.orderBy('date', 'desc')
						.limit(5)
						.get();

						const unknownOwnerPetsData = unknownOwnerPetsQuery.docs.map(doc => doc.data());
						setUnknownOwnerPets(unknownOwnerPetsData);
						setUnknownOwnerPetsLastVisible(unknownOwnerPetsQuery.docs[unknownOwnerPetsQuery.docs.length - 1]);

						console.log('unknown owner pets: ', unknownOwnerPetsData)
					}

					// fetch found pets 
					const fetchFoundPets = async () => {
						const foundPetsQuery = await firestore.collection('posts')
						.where('category', '==', 'Found Pets')
						.orderBy('date', 'desc')
						.limit(5)
						.get();

						const foundPetsData = foundPetsQuery.docs.map(doc => doc.data());
						setFoundPets(foundPetsData);
						setFoundPetsLastVisible(foundPetsQuery.docs[foundPetsQuery.docs.length - 1]);

						console.log('found pets: ', foundPetsData)
					}

					fetchLostPets();
					fetchUnknownOwnerPets();
					fetchFoundPets();
				});

				const unsubscribePets = firestore.collection('pets').where('petOwnerID', '==', user.uid).onSnapshot((querySnapshot) => {
					const userPetsData = querySnapshot.docs.map(doc => doc.data());
					setUserPets(userPetsData);

					console.log('user pets: ', userPetsData)
				});

				setLoading(false);

				// Cleanup function to unsubscribe from the document listeners when the component unmounts
				return () => {
					unsubscribeUser();
					unsubscribePets();
				};
			} else {
				console.log("No user is signed in.");
				setLoading(false);
			}
		});

		// Cleanup function to unsubscribe from the auth listener when the component unmounts
		return () => unsubscribeAuth();
	}, []);

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