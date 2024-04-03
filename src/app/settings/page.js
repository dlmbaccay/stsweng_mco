'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { auth, firestore } from '@/lib/firebase'
import { getAllDocuments } from '@/lib/firestore-crud'
import { checkUsername } from '@/lib/formats'
import WithAuth from '@/components/WithAuth'
import { ModeToggle } from '@/components/mode-toggle'
import Loader from '@/components/Loader'
import toast from 'react-hot-toast'
import NavBar from '@/components/nav/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChangePassword } from '@/components/settings/change-password'

function Settings() {
	const [loading, setLoading] = useState(true)
	const [currentUser, setCurrentUser] = useState([])

	// Account settings
	const [newUsername, setNewUsername] = useState('')
	const [newEmail, setNewEmail] = useState('')

	const [showUsernameTooltip, setShowUsernameTooltip] = useState(false)

	// User privacy
	const [locationVisibility, setLocationVisibility] = useState('')
	const [genderVisibility, setGenderVisibility] = useState('')
	const [birthdayVisibility, setBirthdayVisibility] = useState('')
	const [emailVisibility, setEmailVisibility] = useState('')
	const [phoneVisibility, setPhoneVisibility] = useState('')

	// Pet privacy
	const [petLocationVisibility, setPetLocationVisibility] = useState('')
	const [petGenderVisibility, setPetGenderVisibility] = useState('')
	const [petBirthdayVisibility, setPetBirthdayVisibility] = useState('')
	const [petFaveFoodVisibility, setPetFaveFoodVisibility] = useState('')
	const [petHobbiesVisibility, setPetHobbiesVisibility] = useState('')

	useEffect(() => {
		setLoading(true)

		const unsubscribeAuth = auth.onAuthStateChanged((user) => {
			if (user) {
				console.log('User is signed in.')

				const unsubscribeUser = firestore
					.collection('users')
					.doc(user.uid)
					.onSnapshot((doc) => {
						const userData = doc.data()
						setCurrentUser(userData)
						console.log('current user: ', userData)
						setNewUsername(userData.username)
						setNewEmail(userData.email)
						setLocationVisibility(userData.visibility.location)
						setGenderVisibility(userData.visibility.gender)
						setBirthdayVisibility(userData.visibility.birthdate)
						setEmailVisibility(userData.visibility.email)
						setPhoneVisibility(userData.visibility.phoneNumber)
						setPetLocationVisibility(userData.visibility.petLocation)
						setPetGenderVisibility(userData.visibility.petGender)
						setPetBirthdayVisibility(userData.visibility.petBirthdate)
						setPetFaveFoodVisibility(userData.visibility.petFaveFood)
						setPetHobbiesVisibility(userData.visibility.petHobbies)
					})
				setLoading(false)

				// Cleanup function to unsubscribe from the document listeners when the component unmounts
				return () => {
					unsubscribeUser()
				}
			} else {
				console.log('No user is signed in.')
				setLoading(false)
			}
		})

		// Cleanup function to unsubscribe from the auth listener when the component unmounts
		return () => unsubscribeAuth()
	}, [])

	// Function to save changes to account username and email address
	async function saveAccountSettings() {
		try {
			if (newUsername !== currentUser.username || newEmail !== currentUser.email) {
				if (newUsername !== currentUser.username) {
					const batch = firestore.batch()
					// Update the authorUsername in posts, comments, replies with authorID === currentUser.uid
					const postsRef = await firestore
						.collection('posts')
						.where('authorID', '==', currentUser.uid)
						.get()
					postsRef.docs.forEach((doc) => {
						batch.update(doc.ref, { authorUsername: newUsername })
					})

					const repostedRef = await firestore
						.collection('posts')
						.where('originalPostAuthorID', '==', currentUser.uid)
						.get()
					repostedRef.docs.forEach((doc) => {
						batch.update(doc.ref, { originalPostAuthorUsername: newUsername })
					})

					// Update the authorUsername in the comment documents in comments collection of each post document with userID === currentUser.uid, do it with minimal reads
					const commentsRef = await firestore
						.collectionGroup('comments')
						.where('authorID', '==', currentUser.uid)
						.get()
					commentsRef.docs.forEach((doc) => {
						batch.update(doc.ref, { authorUsername: newUsername })
					})

					const repliesRef = await firestore
						.collectionGroup('replies')
						.where('authorID', '==', currentUser.uid)
						.get()
					repliesRef.docs.forEach((doc) => {
						batch.update(doc.ref, { authorUsername: newUsername })
					})

					// Update the petOwnerUsername in pets with petOwnerID === currentUser.uid
					const petsRef = await firestore
						.collection('pets')
						.where('petOwnerID', '==', currentUser.uid)
						.get()
					petsRef.docs.forEach((doc) => {
						batch.update(doc.ref, { petOwnerUsername: newUsername })
					})

					// Update the username in the notification documents in notifications collection of each user document with userID === currentUser.uid
					const notificationsRef = await firestore
						.collectionGroup('notifications')
						.where('userID', '==', currentUser.uid)
						.get()
					notificationsRef.docs.forEach((doc) => {
						batch.update(doc.ref, { username: newUsername })
					})
					await batch.commit()
				}

				await firestore.collection('users').doc(currentUser.uid).update({
					username: newUsername,
					email: newEmail,
				})

				if (
					auth.currentUser.email !== newEmail &&
					auth.currentUser.providerData[0].providerId === 'password'
				) {
					toast.loading('Updating email address...')
					auth.currentUser.updateEmail(newEmail).then(() => {
						toast.success('Updated email address!')
					})
				}
				toast.success('Account details successfully updated!')
			}
		} catch (error) {
			console.error(error)
			toast.error('An error occurred while saving the account settings.')
		}
	}

	// Function save changes to privacy settings
	async function savePrivacySettings() {
		try {
			await firestore
				.collection('users')
				.doc(currentUser.uid)
				.update({
					visibility: {
						location: locationVisibility,
						birthdate: birthdayVisibility,
						email: emailVisibility,
						gender: genderVisibility,
						phoneNumber: phoneVisibility,
						petLocation: petLocationVisibility,
						petGender: petGenderVisibility,
						petBirthdate: petBirthdayVisibility,
						petFaveFood: petFaveFoodVisibility,
						petHobbies: petHobbiesVisibility,
					},
				})
		} catch (error) {
			console.error(error)
			toast.error('An error occurred while saving the privacy settings.')
		}
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
							<Card className="sm:w-1/2 w-full items-center mt-16 px-4 justify-center flex flex-col border border-secondary">
								{/* Settings Header */}
								<div className="flex items-center justify-center w-full my-4">
									<h1 className="text-2xl font-bold mb-4">Settings</h1>
								</div>

								{/* Account Settings */}
								<div className="lg:w-3/4 w-full mb-4 lg:mx-12 mx-4 flex flex-col border border-secondary p-4 rounded-lg">
									<h2 className="text-xl font-bold mb-2">Account Settings</h2>
									<div className="flex flex-col lg:pl-6 pl-2 w-full gap-2">
										<div className="flex flex-row items-center w-full border border-secondary rounded-lg pl-2">
											<label
												htmlFor="username"
												className="font-semibold w-1/3"
											>
												Username
											</label>
											<div className="flex flex-col w-full">
												<Input
													type="text"
													id="username"
													value={newUsername}
													className={`border border-slate-400 p-2 rounded-md w-full text-primary ${
														newUsername === ''
															? ''
															: !checkUsername(newUsername)
															? 'border-red-500'
															: 'border-green-500'
													}`}
													placeholder="Enter your username"
													required
													onFocus={() => setShowUsernameTooltip(true)}
													onBlur={() => setShowUsernameTooltip(false)}
													minLength={3}
													onChange={(e) =>
														setNewUsername(e.target.value.toLowerCase())
													}
												/>
											</div>
										</div>
										{showUsernameTooltip && (
											<div className=" flex flex-col w-full pl-2 gap-4">
												<div>
													<p
														className={`text-xs ${
															newUsername.length >= 3 &&
															newUsername.length <= 15
																? 'text-green-500'
																: 'text-slate-400'
														}`}
													>
														- Be 3-15 characters long.
													</p>
													<p
														className={`text-xs ${
															/^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/.test(
																newUsername,
															)
																? 'text-green-500'
																: 'text-slate-400'
														}`}
													>
														- Start and end with alphanumeric
														characters.
													</p>
													<p
														className={`text-xs ${
															/^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/.test(
																newUsername,
															)
																? 'text-green-500'
																: 'text-slate-400'
														}`}
													>
														- Underscores or periods must be in between
														alphanumeric characters.
													</p>
												</div>
											</div>
										)}
										<div className="flex flex-row items-center w-full border border-secondary rounded-lg pl-2">
											<label htmlFor="email" className="font-semibold w-1/3">
												Email
											</label>
											<Input
												type="email"
												id="email"
												value={newEmail}
												disabled={
													auth.currentUser.providerData[0].providerId !==
													'password'
												}
												onChange={(e) => setNewEmail(e.target.value)}
												className="text-primary"
											/>
										</div>
										<span
											className={`italic text-sm text-gray-500 mt-4 ${
												auth.currentUser.providerData[0].providerId !==
													'google.com' && 'hidden'
											}`}
										>
											You are currently logged in with Google. Password change
											can only be made through Google.
										</span>
										<div
											className={`flex flex-row items-center w-fit p-2 border border-secondary rounded-lg`}
										>
											<label
												htmlFor="password"
												className="font-semibold pr-4"
											>
												Password
											</label>
											<ChangePassword />
										</div>
									</div>
									<div className="w-full mt-8 justify-center flex">
										<Button
											className="w-fit px-4"
											onClick={saveAccountSettings}
										>
											Save Changes
										</Button>
									</div>
								</div>

								{/* Privacy Settings */}
								<div className="lg:w-3/4 w-full mb-4 lg:mx-12 mx-4 flex flex-col border border-secondary p-4 rounded-lg">
									<h2 className="text-xl font-bold mb-2">Privacy Settings</h2>
									<div className="flex flex-col lg:pl-6 pl-2 w-full gap-2">
										<div className="py-2 w-full justify-start">
											<p className="italic">
												All details are public by default. You can choose to
												make your profile details public, private, or
												followers only.
											</p>
										</div>
										<Separator className="bg-secondary w-2/3" />

										{/* User Privacy */}
										<h3 className="text-lg italic font-bold mt-2">
											User Profile Privacy
										</h3>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="location"
												className="font-semibold w-1/3"
											>
												Location
											</label>
											<Select
												required
												onValueChange={(value) =>
													setLocationVisibility(value)
												}
												value={locationVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{locationVisibility === 'public'
														? 'Public'
														: locationVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label htmlFor="gender" className="font-semibold w-1/3">
												Gender
											</label>
											<Select
												required
												onValueChange={(value) =>
													setGenderVisibility(value)
												}
												value={genderVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{genderVisibility === 'public'
														? 'Public'
														: genderVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="birthday"
												className="font-semibold w-1/3"
											>
												Birthdate
											</label>
											<Select
												required
												onValueChange={(value) =>
													setBirthdayVisibility(value)
												}
												value={birthdayVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{birthdayVisibility === 'public'
														? 'Public'
														: birthdayVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label htmlFor="phone" className="font-semibold w-1/3">
												Phone No.
											</label>
											<Select
												required
												onValueChange={(value) => setPhoneVisibility(value)}
												value={phoneVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{phoneVisibility === 'public'
														? 'Public'
														: phoneVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label htmlFor="email" className="font-semibold w-1/3">
												Email
											</label>
											<Select
												required
												onValueChange={(value) => setEmailVisibility(value)}
												value={emailVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{emailVisibility === 'public'
														? 'Public'
														: emailVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<Separator className="bg-secondary w-2/3" />

										{/* Pet Privacy */}
										<h3 className="text-lg italic font-bold mt-2">
											Pet Profile Privacy
										</h3>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="pet-location"
												className="font-semibold w-1/3"
											>
												Location
											</label>
											<Select
												required
												onValueChange={(value) =>
													setPetLocationVisibility(value)
												}
												value={petLocationVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{petLocationVisibility === 'public'
														? 'Public'
														: petLocationVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="pet-gender"
												className="font-semibold w-1/3"
											>
												Gender
											</label>
											<Select
												required
												onValueChange={(value) =>
													setPetGenderVisibility(value)
												}
												value={petGenderVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{petGenderVisibility === 'public'
														? 'Public'
														: petGenderVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="pet-birthday"
												className="font-semibold w-1/3"
											>
												Birthdate
											</label>
											<Select
												required
												onValueChange={(value) =>
													setPetBirthdayVisibility(value)
												}
												value={petBirthdayVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{petBirthdayVisibility === 'public'
														? 'Public'
														: petBirthdayVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="fav-food"
												className="font-semibold w-1/3"
											>
												Favorite Food
											</label>
											<Select
												required
												onValueChange={(value) =>
													setPetFaveFoodVisibility(value)
												}
												value={petFaveFoodVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{petFaveFoodVisibility === 'public'
														? 'Public'
														: petFaveFoodVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-row items-center justify-between md:w-1/2 w-full rounded-lg md:pl-4 pl-2">
											<label
												htmlFor="pet-hobbies"
												className="font-semibold w-1/3"
											>
												Hobbies
											</label>
											<Select
												required
												onValueChange={(value) =>
													setPetHobbiesVisibility(value)
												}
												value={petHobbiesVisibility}
											>
												<SelectTrigger className="w-36 border border-secondary text-primary">
													{petHobbiesVisibility === 'public'
														? 'Public'
														: petHobbiesVisibility === 'private'
														? 'Private'
														: 'Followers Only'}
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
													<SelectItem value="followers">
														Followers Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="w-full mt-8 justify-center flex">
										<Button
											className="w-fit px-4"
											onClick={savePrivacySettings}
										>
											Save Changes
										</Button>
									</div>
								</div>
							</Card>
						</div>
					</div>
				)
			)}
		</>
	)
}

export default WithAuth(Settings)
