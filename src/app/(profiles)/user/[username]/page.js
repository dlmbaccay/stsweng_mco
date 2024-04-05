'use client'

import { toast } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { isEqual, set } from 'lodash'
import { auth, firestore } from '@/lib/firebase'
import { handleDateFormat } from '@/lib/helper-functions'
import Loader from '@/components/Loader'
import NavBar from '@/components/nav/navbar'
import CoverPhoto from '@/components/ui/cover-photo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EditUserProfile } from '@/components/edit-dialogs/edit-user-profile'
import { CreatePetProfile } from '@/components/profile/create-pet-profile'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import WithAuth from '@/components/WithAuth'
import { FollowUserButton } from '@/components/profile/follow-user-button'
import { CreatePost } from '@/components/post-components/create-post'
import { PetsContainer } from '@/components/profile/pet-container'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags } from '@fortawesome/free-solid-svg-icons'
import { PostSnippet } from '@/components/post-components/post-snippet'
import { RepostSnippet } from '@/components/post-components/repost-snippet'

function UserProfile() {
	const router = useRouter()
	const urlParams = useParams()
	const [userData, setUserData] = useState([])
	const [loading, setLoading] = useState(true)

	const [activeTab, setActiveTab] = useState('posts')
	const [currentUser, setCurrentUser] = useState([{}])

	const [visibleDetails, setVisibleDetails] = useState([])

	const [userPets, setUserPets] = useState([])

	const [userPosts, setUserPosts] = useState([])
	const [userPostsLoaded, setUserPostsLoaded] = useState(false)
	const [userPostsLastVisible, setUserPostsLastVisible] = useState(null)

	const [loadingPosts, setLoadingPosts] = useState(false)

	useEffect(() => {
		setLoading(true)

		const unsubscribeAuth = auth.onAuthStateChanged((user) => {
			let unsubscribeCurrentUser
			let unsubscribeProfileUser
			let unsubscribeUserPets

			if (user) {
				console.log('User is signed in.')

				// fetch current user data
				unsubscribeCurrentUser = firestore
					.collection('users')
					.doc(user.uid)
					.onSnapshot((doc) => {
						const userData = doc.data()
						setCurrentUser(userData)
					})

				// fetch profile user data
				unsubscribeProfileUser = firestore
					.collection('users')
					.where('username', '==', urlParams.username)
					.onSnapshot((querySnapshot) => {
						const profileUserData = querySnapshot.docs.map((doc) => doc.data())[0]
						setUserData(profileUserData)

						// set visibility
						const includeFields = []

						for (const field in profileUserData.visibility) {
							const visibilitySetting = profileUserData.visibility[field]

							if (visibilitySetting === 'public') {
								includeFields.push(field)
							} else if (
								visibilitySetting === 'followers' &&
								(currentUser.uid in profileUserData.followers ||
									currentUser.uid === profileUserData.uid)
							) {
								includeFields.push(field)
							}
						}

						setVisibleDetails(includeFields)

						// fetch profile user pets
						unsubscribeUserPets = firestore
							.collection('pets')
							.where('petOwnerID', '==', profileUserData.uid)
							.onSnapshot((querySnapshot) => {
								const userPetsData = querySnapshot.docs.map((doc) => doc.data())
								setUserPets(userPetsData)
							})

						// fetch profile user posts
						const fetchUserPosts = async () => {
							const response = await firestore
								.collection('posts')
								.where('authorID', '==', profileUserData.uid)
								.orderBy('date', 'desc')
								.limit(5)
								.get()
							const postDocs = response.docs.map((doc) => ({
								id: doc.id,
								...doc.data(),
							}))
							setUserPosts(postDocs)
							setUserPostsLastVisible(response.docs[response.docs.length - 1])
						}

						fetchUserPosts()
					})

				setLoading(false)
			} else {
				console.log('No user is signed in.')
				setLoading(false)
			}

			// Cleanup function to unsubscribe from the document listeners when the component unmounts
			return () => {
				unsubscribeCurrentUser()
				unsubscribeProfileUser()
				unsubscribeUserPets()
			}
		})

		// Cleanup function to unsubscribe from the auth listener when the component unmounts
		return () => unsubscribeAuth()
	}, [urlParams])

	const fetchMoreUserPosts = async () => {
		setLoadingPosts(true)
		const nextQuery = await firestore
			.collection('posts')
			.where('authorID', '==', userData.uid)
			.orderBy('date', 'desc')
			.startAfter(userPostsLastVisible)
			.limit(5)
			.get()

		const newPosts = nextQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
		const newLastVisible = nextQuery.docs[nextQuery.docs.length - 1]

		// Update state based on whether new posts are fetched
		if (newPosts.length === 0) {
			setUserPostsLoaded(true)
		} else {
			setUserPostsLastVisible(newLastVisible)
			setUserPosts((prevPosts) => [...prevPosts, ...newPosts])
			setUserPostsLoaded(false)
		}

		setLoadingPosts(false)
	}

	const refreshUserPosts = async () => {
		setLoadingPosts(true)
		const refreshQuery = await firestore
			.collection('posts')
			.where('authorID', '==', userData.uid)
			.orderBy('date', 'desc')
			.limit(5)
			.get()

		const refreshedPosts = refreshQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
		setUserPosts(refreshedPosts)
		setUserPostsLastVisible(refreshQuery.docs[refreshQuery.docs.length - 1])
		setUserPostsLoaded(false)
		setLoadingPosts(false)
	}

	return (
		<>
			{loading ? (
				<Loader show={true} />
			) : (
				currentUser && (
					<div className="flex">
						{/* Navbar */}
						<div className="min-h-16 w-full z-50 fixed">
							<NavBar
								props={{
									uid: currentUser.uid,
									username: currentUser.username,
									userPhotoURL: currentUser.userPhotoURL,
									expand_lock: false,
								}}
							/>
						</div>

						{userData && (
							<div className="w-full h-screen z-10 mt-16 pb-32 flex flex-col items-center justify-start">
								{/* Cover Photo */}
								<div className="h-[30%] xl:w-[60%] 2xl:w-[60%] w-full">
									<Image
										src={
											userData.coverPhotoURL
												? userData.coverPhotoURL
												: '/images/coverPhotoHolder.png'
										}
										alt={'cover photo'}
										width={0}
										height={0}
										sizes="100vw"
										className="w-full h-full rounded-b-lg aspect-square object-cover drop-shadow-xl outline-none border-none"
									/>
								</div>

								{/* Profile Details */}
								<div className="flex md:flex-row flex-col md:items-start items-center md:justify-start xl:w-[60%] 2xl:w-[60%] w-full md:h-[110px] h-fit lg:px-10 px-5 md:translate-y-0 -translate-y-12">
									{/* Profile Photo */}
									<div className="md:-translate-y-12 flex items-center justify-center md:w-[20%] w-40">
										<Image
											src={
												userData.userPhotoURL
													? userData.userPhotoURL
													: '/images/profilePictureHolder.jpg'
											}
											alt="user photo"
											width={175}
											height={175}
											className="border-2 border-white dark:border-dark_gray rounded-full aspect-square object-cover drop-shadow-md"
										/>
									</div>

									{/* Display Name, Username, Followers, Following */}
									<div className="flex flex-col gap-2 items-center md:text-justify text-center md:items-start h-full justify-end w-[60%] md:ml-4 ">
										{/* Display Name and Username Section */}
										<div className="flex flex-col">
											<p className="font-semibold text-3xl tracking-wide">
												{userData.displayName}
											</p>
											<p className=" font-semibold tracking-wide text-muted_blue dark:text-light_yellow">
												@{userData.username}
											</p>
										</div>

										{/* Followers and Following Section */}
										<div className="flex flex-row justify-start gap-2 text-sm font-semibold">
											<div className="flex items-center gap-1">
												<p>
													{userData.followers &&
														userData.followers.length}
												</p>
												<p className="dark:text-light_yellow text-muted_blue">
													Followers
												</p>
											</div>
											<div className="flex items-center gap-1">
												<p>
													{userData.following &&
														userData.following.length}
												</p>
												<p className="dark:text-light_yellow text-muted_blue">
													Following
												</p>
											</div>
										</div>
									</div>

									{/* Edit Profile / Follow Button */}
									<div className="flex h-full md:items-end md:justify-end items-center justify-center md:my-0 my-4 w-[20%]">
										{currentUser && currentUser.uid === userData.uid ? (
											// Edit Button
											<EditUserProfile
												props={{
													uid: userData.uid,
													displayName: userData.displayName,
													userPhotoURL: userData.userPhotoURL
														? userData.userPhotoURL
														: '',
													coverPhotoURL: userData.coverPhotoURL
														? userData.coverPhotoURL
														: '',
													about: userData.about,
													location: userData.location,
													gender: userData.gender,
													birthdate: userData.birthdate,
													phoneNumber: userData.phoneNumber,
												}}
											/>
										) : (
											// Follow Button
											<FollowUserButton
												props={{
													profileUser_pets: userPets,
													profileUser_uid: userData.uid,
													profileUser_name: userData.username,
													currentUser_uid: currentUser.uid,
													profileUser_followers: userData.followers,
													currentUser_following: currentUser.following,
												}}
											/>
										)}
									</div>
								</div>

								{/* Main Container */}
								<div className="flex flex-col xl:flex-row xl:w-[60%] 2xl:w-[60%] w-full px-10 md:mt-8">
									{/* About and Details Containers */}
									<div className="flex flex-col items-start xl:w-[30%] 2xl:w-[30%] w-full gap-6">
										{userData.about && (
											<Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
												<div className="flex flex-col justify-start gap-4">
													<h1 className="tracking-wide font-bold text-lg text-muted_blue dark:text-light_yellow">
														About
													</h1>
													<p className="tracking-wide break-words">
														{userData.about}
													</p>
												</div>
											</Card>
										)}

										<Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
											<h1 className="tracking-wide font-bold text-lg pb-4 text-muted_blue dark:text-light_yellow">
												Details
											</h1>

											<div className="flex items-start flex-col gap-2 break-all">
												{/* Location */}
												{visibleDetails.includes('location') && (
													<div className="flex items-center justify-center gap-1">
														<i className="flex items-center justify-center  w-[20px] fa-solid fa-location-dot " />
														<p className="tracking-wide">
															{userData.location}
														</p>
													</div>
												)}

												{/* Gender */}
												{visibleDetails.includes('gender') && (
													<div className="flex items-center justify-center gap-1">
														<i className="flex items-center justify-center  w-[20px] fa-solid fa-venus-mars" />
														<p className="tracking-wide">
															{userData.gender}
														</p>
													</div>
												)}

												{/* Birthday */}
												{visibleDetails.includes('birthdate') && (
													<div className="flex items-center justify-center gap-1">
														<i className="flex items-center justify-center  w-[20px] fa-solid fa-cake-candles" />
														<p className="tracking-wide">
															{userData.birthdate}
														</p>
													</div>
												)}
												{/* Phone Number */}
												{visibleDetails.includes('phoneNumber') && (
													<div className="flex items-center justify-center gap-1">
														<i className="flex items-center justify-center  w-[20px] fa-solid fa-phone" />
														<p className="tracking-wide">
															{userData.phoneNumber}
														</p>
													</div>
												)}

												{/* Email */}
												{visibleDetails.includes('email') && (
													<div className="flex items-center justify-center gap-1">
														<i className="flex items-center justify-center  w-[20px] fa-solid fa-envelope" />
														<p className="tracking-wide">
															{userData.email}
														</p>
													</div>
												)}
											</div>
										</Card>
									</div>

									{/* Posts and Pets Containers */}
									<div className="xl:w-[70%] 2xl:w-[70%] xl:mt-0 2xl:mt-0 mt-8 w-full xl:ml-6 2xl:ml-6">
										{/* Tabs */}
										<div className="mb-6 flex flex-row font-bold w-full h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm gap-1">
											<div
												className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${
													activeTab == 'posts'
														? 'bg-muted_blue dark:bg-light_yellow text-white dark:text-black'
														: 'hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all'
												}`}
												onClick={() => setActiveTab('posts')}
											>
												Posts
											</div>

											<div
												className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${
													activeTab == 'pets'
														? 'bg-muted_blue dark:bg-light_yellow text-white dark:text-black'
														: 'hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all'
												}`}
												onClick={() => setActiveTab('pets')}
											>
												Pets
											</div>
										</div>

										{activeTab == 'posts' ? (
											<>
												{currentUser.uid === userData.uid ? (
													<Card className="drop-shadow-md rounded-sm mb-6">
														<div className="flex flex-row items-center w-full my-2">
															<div className="ml-4">
																<Image
																	src={
																		userData.userPhotoURL == ''
																			? '/images/profilePictureHolder.jpg'
																			: userData.userPhotoURL
																	}
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
																		username:
																			currentUser.username,
																		displayname:
																			currentUser.displayName,
																		userphoto:
																			currentUser.userPhotoURL,
																		pets: userPets,
																		type: 'Default',
																	}}
																/>
															</div>
														</div>
													</Card>
												) : null}
												<div className="flex flex-col min-w-full items-center justify-center gap-6 mb-6">
													{userPosts.length === 0 ? (
														<div className="flex items-center justify-center">
															<p>No posts yet.</p>
														</div>
													) : (
														userPosts.map((post) => {
															return post.postType == 'Original' ? (
																<PostSnippet
																	key={post.id}
																	post={post}
																	currentUser={currentUser}
																/>
															) : post.postType == 'Repost' ? (
																<RepostSnippet
																	key={post.id}
																	post={post}
																	currentUser={currentUser}
																/>
															) : null
														})
													)}

													{userPosts.length !== 0 && userPostsLoaded ? (
														<button
															className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${
																loadingPosts ? 'hidden' : 'flex'
															}`}
															onClick={refreshUserPosts}
														>
															Refresh Posts
														</button>
													) : userPosts.length !== 0 &&
													  !userPostsLoaded ? (
														<button
															className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${
																loadingPosts ? 'hidden' : 'flex'
															}`}
															onClick={fetchMoreUserPosts}
															disabled={loadingPosts}
														>
															Load More
														</button>
													) : null}

													{loadingPosts && (
														<div className="mb-20 flex items-center justify-center">
															Loading...
														</div>
													)}
												</div>
											</>
										) : (
											<Card className="p-4 rounded-md drop-shadow-md">
												{userData && userPets && (
													<PetsContainer
														props={{
															uid: userData.uid,
															username: userData.username,
															displayName: userData.displayName,
															location: userData.location,
															userPhotoURL: userData.userPhotoURL,
															coverPhotoURL: userData.coverPhotoURL,
															pets: userPets,
															currentUserID: currentUser.uid,
														}}
													/>
												)}
											</Card>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				)
			)}
		</>
	)
}

export default WithAuth(UserProfile)
