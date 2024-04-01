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
import { set } from "lodash";

function HomePage() {
	const [userData, setUserData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState([]);
	const [userPets, setUserPets] = useState([]);

	const [activeTab, setActiveTab] = useState("For You");
	const [userPosts, setUserPosts] = useState([]);
	const urlParams = useParams();

	const [allPosts, setAllPosts] = useState([]);
	const [allPostsLoaded, setAllPostsLoaded] = useState(false);
	const [allPostsLastVisible, setAllPostsLastVisible] = useState(null);

	const [followingPosts, setFollowingPosts] = useState([]);
	const [followingPostsLoaded, setFollowingPostsLoaded] = useState(false);
	const [followingLastVisible, setFollowingLastVisible] = useState(null);

	const [loadingPosts, setLoadingPosts] = useState(false);
	const [userFollowing, setUserFollowing] = useState([]);

	useEffect(() => {
		setLoading(true);

		const unsubscribeAuth = auth.onAuthStateChanged((user) => {
			if (user) {
				console.log("User is signed in.");

				const unsubscribeUser = firestore.collection('users').doc(user.uid).onSnapshot((doc) => {
					const userData = doc.data()
					setCurrentUser(userData);
					setUserFollowing(doc.data().following);

					console.log('current user: ', userData);
					console.log('user following: ', doc.data().following);

					// fetch all posts 
					const fetchAllPosts = async () => {
						const allPostsQuery = await firestore.collection('posts')
						.orderBy("date", "desc")
						.limit(5)
						.get();

						const allPostsData = allPostsQuery.docs.map(doc => doc.data());
						setAllPosts(allPostsData);
						setAllPostsLastVisible(allPostsQuery.docs[allPostsQuery.docs.length - 1]);

						console.log('all posts: ', allPostsData)
					}

					// fetch following posts
					const fetchFollowingPosts = async () => {
						const followingPostsQuery = await firestore.collection('posts')
						.where("authorID", "in", doc.data().following)
						.orderBy("date", "desc")
						.limit(5)
						.get();

						const followingPostsData = followingPostsQuery.docs.map(doc => doc.data());
						setFollowingPosts(followingPostsData);
						setFollowingLastVisible(followingPostsQuery.docs[followingPostsQuery.docs.length - 1]);

						console.log('following posts: ', followingPostsData)
					}

					fetchAllPosts();
					if (doc.data().following.length > 0) {
						fetchFollowingPosts();
					}
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

	const fetchMoreAllPosts = async () => {
		setLoadingPosts(true);
		const nextQuery = await firestore.collection('posts')
		.orderBy("date", "desc")
		.startAfter(allPostsLastVisible)
		.limit(5)
		.get();

		const newPosts = nextQuery.docs.map(doc => doc.data());
		const newLastVisible = nextQuery.docs[nextQuery.docs.length - 1];

		// Update state based on whether new posts are fetched
		if (newPosts.length === 0) {
			setAllPostsLoaded(true);
		} else {
			setAllPostsLastVisible(newLastVisible);
			setAllPosts(prevPosts => [...prevPosts, ...newPosts]);
			setAllPostsLoaded(false);
		}

		setLoadingPosts(false);
	}

	const refreshAllPosts = async () => {
		setLoadingPosts(true);
		const refreshQuery = await firestore.collection('posts')
		.orderBy("date", "desc")
		.limit(5)
		.get();

		const refreshedPosts = refreshQuery.docs.map(doc => doc.data());
		setAllPosts(refreshedPosts);
		setAllPostsLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1]);
		setAllPostsLoaded(false);
		setLoadingPosts(false);
	}

	const fetchMoreFollowingPosts = async () => {
		setLoadingPosts(true);
		const nextQuery = await firestore.collection('posts')
		.where("authorID", "in", currentUser.following)
		.orderBy("date", "desc")
		.startAfter(followingLastVisible)
		.limit(5)
		.get();

		const newPosts = nextQuery.docs.map(doc => doc.data());
		const newLastVisible = nextQuery.docs[nextQuery.docs.length - 1];

		// Update state based on whether new posts are fetched
		if (newPosts.length === 0) {
			setFollowingPostsLoaded(true);
		} else {
			setFollowingLastVisible(newLastVisible);
			setFollowingPosts(prevPosts => [...prevPosts, ...newPosts]);
			setFollowingPostsLoaded(false);
		}

		setLoadingPosts(false);
	}

	const refreshFollowingPosts = async () => {
		setLoadingPosts(true);
		const refreshQuery = await firestore.collection('posts')
		.where("authorID", "in", currentUser.following)
		.orderBy("date", "desc")
		.limit(5)
		.get();

		const refreshedPosts = refreshQuery.docs.map(doc => doc.data());
		setFollowingPosts(refreshedPosts);
		setFollowingLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1]);
		setFollowingPostsLoaded(false);
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
										activeTab == "For You"
											? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black"
											: "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"
									}`}
									onClick={() => setActiveTab("For You")}
								>
									For You
								</div>

								<div
									className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${
										activeTab == "Following"
											? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black"
											: "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"
									}`}
									onClick={() => setActiveTab("Following")}
								>
									Following
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

								{activeTab == "For You" ? (
									<>
										<div className="flex flex-col w-full items-center justify-center gap-6">
											{ allPosts.length === 0 ? (
												<div className="flex items-center justify-center gap-2">
													<p className="font-semibold">No Posts Yet</p>
													<i className="fa-solid fa-frog"/>
												</div>
												) : (
													allPosts.map((post) => {
														return post.postType == "Original" ? (
															<PostSnippet
																key={post.postID}
																post={post}
																currentUser={currentUser}
															/>
														) : post.postType == "Repost" ? (
															<RepostSnippet
																key={post.postID}
																post={post}
																currentUser={currentUser}
															/>
														) : null;
													})
												)
											}

											{ allPosts.length !== 0 && allPostsLoaded ? (
												<Button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={refreshAllPosts}
												>
												Refresh Posts
												</Button>
											) : allPosts.length !== 0 && !allPostsLoaded ? (
												<Button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={fetchMoreAllPosts}
												disabled={loadingPosts}
												>
												Load More
												</Button>
											) : null }

											{loadingPosts && <div className="mb-20 flex items-center justify-center">Loading...</div>}
										</div>
									</>
								) : (
									<>
										<div className="flex flex-col min-w-full items-center justify-center gap-6">

											{ followingPosts.length === 0 ? (
												<div className="flex items-center justify-center gap-2">
													<p className="font-semibold">No Posts Yet</p>
													<i className="fa-solid fa-frog"/>
												</div>
												) : (
													followingPosts.map((post) => {
														return post.postType == "Original" ? (
															<PostSnippet
																key={post.postID}
																post={post}
																currentUser={currentUser}
															/>
														) : post.postType == "Repost" ? (
															<RepostSnippet
																key={post.postID}
																post={post}
																currentUser={currentUser}
															/>
														) : null;
													})
												)
											}

											{ followingPosts.length !== 0 && followingPostsLoaded ? (
												<button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={refreshFollowingPosts}
												>
												Refresh Posts
												</button>
											) : followingPosts.length !== 0 && ! followingPostsLoaded ? (
												<button
												className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${loadingPosts ? 'hidden' : 'flex'}`}
												onClick={fetchMoreFollowingPosts}
												disabled={loadingPosts}
												>
												Load More
												</button>
											) : null }

											{loadingPosts && <div className="mb-20 flex items-center justify-center">Loading...</div>}
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				)
			)}
		</>
	);
}

export default WithAuth(HomePage);