import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { handleImageFilePreview } from '@/lib/helper-functions'
import { checkDisplayName, checkLocation } from '@/lib/formats'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { PhoneInput } from '@/components/ui/phone-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RoundImage from '@/components/round-image'
import Loader from '@/components/Loader'
import { set } from 'date-fns'
import { firestore } from '@/lib/firebase'

export function CreatePetProfile({ props }) {
	const [loading, setLoading] = useState(false)

	const { uid, username, displayName, location, userPhotoURL, coverPhotoURL } = props

	const router = useRouter()

	const [petName, setPetName] = useState('')
	const [petPhotoURL, setPetPhotoURL] = useState('')
	const [petBreed, setPetBreed] = useState('')
	const [petSex, setPetSex] = useState('')
	const [petAbout, setPetAbout] = useState('')
	const [petBirthdate, setPetBirthdate] = useState('')
	const [petBirthplace, setPetBirthplace] = useState(location)
	const [petFavoriteFood, setPetFavoriteFood] = useState('')
	const [petHobbies, setPetHobbies] = useState('')

	const [showDisplayNameTooltip, setShowDisplayNameTooltip] = useState(false)
	const [showLocationTooltip, setShowLocationTooltip] = useState(false)

	const [petPhotoPreviewUrl, setPetPhotoPreviewUrl] = useState('/images/petPictureHolder.jpg')

	const [submitDisabled, setSubmitDisabled] = useState(false)

	const handleFileChange = (event) => {
		var temp = handleImageFilePreview(event.target.files[0])
		if (temp == null) {
			setUserPhoto('')
			setPreviewUrl('/images/petPictureHolder.jpg')
		} else {
			setPetPhotoURL(temp[0])
			setPetPhotoPreviewUrl(temp[1])
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (petName === '' || petSex === '' || petBirthdate === '' || petBirthplace === '') {
			toast.error('Please fill in all required fields.')
			return
		}

		try {
			setSubmitDisabled(true)
			toast.loading('Creating pet profile...')
			if (petPhotoURL) {
				// Create a new document in the 'pets' collection with the given data
				const petID = firestore.collection('pets').doc().id

				const formData = new FormData()
				formData.append('action', 'uploadPetProfile')
				formData.append('pet', petID)
				formData.append('file', petPhotoURL)

				// Upload user photo
				await fetch('/api/pet-setup/upload-file', {
					method: 'POST',
					body: formData,
				})
					.then((response) => response.json())
					.then(async (data) => {
						console.log(data)
						setPetPhotoURL(data.url)
						// save pet data
						await savePetData(petID, data.url)
					})
			} else {
				const petID = firestore.collection('pets').doc().id
				await savePetData(petID, petPhotoURL)
			}

			async function savePetData(petID, petPhotoURL) {
				await fetch('/api/pet-setup/save-pet-data', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'savePetData',
						petOwnerID: uid,
						petID: petID,
						petOwnerUsername: username,
						petOwnerDisplayName: displayName,
						petOwnerUserPhotoURL: userPhotoURL,
						petOwnerCoverPhotoURL: coverPhotoURL,
						petName: petName,
						petPhotoURL: petPhotoURL,
						petBreed: petBreed,
						petSex: petSex,
						petAbout: petAbout,
						petBirthplace: petBirthplace,
						petBirthdate: petBirthdate,
						petFavoriteFood: petFavoriteFood,
						petHobbies: petHobbies,
					}),
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.success) {
							setSubmitDisabled(false)
							toast.dismiss()
							toast.success(`${petName}'s profile created successfully!`)
							router.push(`/pet/${petID}`)
						}
					})
			}
		} catch (error) {
			toast.error('Error creating pet profile. Please try again.')
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Card className="mb-4 flex flex-col gap-2 items-center justify-center md:w-1/4 w-full h-[200px] hover:bg-white dark:hover:bg-dark_gray px-6 py-4 hover:drop-shadow-md transition-all hover:scale-105 cursor-pointer">
					<i className="fa-solid fa-paw text-5xl flex items-center justify-center bg-muted_blue text-white dark:text-dark_gray dark:bg-light_yellow w-[80px] h-[80px] rounded-full flex-shrink-0" />
					<p className="font-bold mt-2 text-center w-full">Add Pet</p>
				</Card>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] lg:max-w-[1080px] h-[500px] md:h-auto overflow-auto">
				{loading ? (
					<Loader show={loading} />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Create Pet Profile</DialogTitle>
							<DialogDescription>
								Create a profile for your pet and let others know more about them.
								Click submit when you&apos;re done.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<div className="flex items-start justify-start w-full md:gap-6 gap-2">
								{/* pet display name */}
								<div className="w-1/2 mt-4">
									<label
										htmlFor="display-name"
										className="block text-sm font-medium text-raisin_black"
									>
										<span>Pet Name</span>
										<span className="text-red-500"> *</span>
									</label>
									<Input
										type="text"
										id="display-name"
										placeholder="What would you like us to call your pet?"
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${
											displayName === ''
												? ''
												: !checkDisplayName(petName)
												? 'border-red-500'
												: 'border-green-500'
										}`}
										required
										onFocus={() => setShowDisplayNameTooltip(true)}
										onBlur={() => setShowDisplayNameTooltip(false)}
										maxLength={30}
										minLength={1}
										onChange={(e) => setPetName(e.target.value)}
									/>

									{showDisplayNameTooltip && (
										<div className="mt-4 flex flex-row w-full pl-2 gap-4">
											<div>
												<p
													className={`text-xs ${
														displayName.length >= 1 &&
														displayName.length <= 30
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- Be 1-30 characters long.
												</p>
												<p
													className={`text-xs ${
														/^[^\s]+(\s+[^\s]+)*$/.test(displayName)
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- No blank spaces on either ends.
												</p>
											</div>
										</div>
									)}
								</div>

								{/* pet breed */}
								<div className="w-1/2 mt-4">
									<label
										htmlFor="breed"
										className={`block text-sm font-medium text-raisin_black`}
									>
										<span>Breed</span>
										<span className="text-red-500"> *</span>
									</label>
									<Input
										type="text"
										id="breed"
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="What breed is your pet?"
										required
										maxLength={30}
										minLength={1}
										onChange={(e) => setPetBreed(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex items-start justify-center w-full md:gap-6 gap-2">
								{/* pet photo */}
								<div className="w-1/2 mt-4">
									<label
										htmlFor="profile-pic"
										className="block text-sm font-medium text-raisin_black"
									>
										Profile Picture
										<span className="text-raisin_black text-xs">
											{' '}
											(JPG, PNG, or GIF).
										</span>
									</label>

									<Input
										type="file"
										onChange={handleFileChange}
										accept="image/x-png,image/gif,image/jpeg"
										className="border border-slate-400 mt-2 md:mb-10 mb-2 rounded-md w-full"
									/>

									{!petPhotoPreviewUrl && (
										<div className="flex md:mx-auto justify-center w-full drop-shadow-md">
											<Image
												src={'/images/petPictureHolder.jpg'}
												alt="Profile Picture"
												width={200}
												height={200}
												className="rounded-full object-cover aspect-square"
											/>
										</div>
									)}

									{petPhotoPreviewUrl && (
										<div className="flex md:mx-auto justify-center w-full drop-shadow-md">
											<Image
												src={petPhotoPreviewUrl}
												alt="Preview"
												width={200}
												height={200}
												className="rounded-full object-cover aspect-square"
											/>
										</div>
									)}
								</div>

								{/* about, favorite food, hobbies */}
								<div className="w-1/2 flex flex-col h-full md:justify-between justify-start">
									{/* about */}
									<div className="w-full mt-4">
										<label
											htmlFor="about"
											className="block text-sm font-medium text-raisin_black"
										>
											<span>About</span>
										</label>
										<Textarea
											type="text"
											id="about"
											className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
											placeholder="Tell us about your pet!"
											maxLength={100}
											minLength={1}
											onChange={(e) => setPetAbout(e.target.value)}
										/>
									</div>

									{/* favorite food */}
									<div className="w-full mt-4">
										<label
											htmlFor="favorite-food"
											className="block text-sm font-medium text-raisin_black"
										>
											<span>Favorite Food</span>
										</label>
										<Input
											type="text"
											id="favorite-food"
											className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
											placeholder="What's your pet's favorite food? i.e. Chicken, Beef, etc."
											maxLength={30}
											minLength={1}
											onChange={(e) => setPetFavoriteFood(e.target.value)}
										/>
									</div>

									{/* hobbies */}
									<div className="w-full mt-4">
										<label
											htmlFor="hobbies"
											className="block text-sm font-medium text-raisin_black"
										>
											<span>Hobbies</span>
										</label>
										<Input
											type="text"
											id="hobbies"
											className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
											placeholder="What are your pet's hobbies? i.e. Barking, Eating, etc."
											maxLength={30}
											minLength={1}
											onChange={(e) => setPetHobbies(e.target.value)}
										/>
									</div>
								</div>
							</div>

							<div className="flex md:items-start items-center justify-start md:gap-6 gap-2">
								{/* sex */}
								<div className="w-full mt-4">
									<label
										htmlFor="gender"
										className="mb-2 block text-sm font-medium text-raisin_black"
									>
										<span>Sex</span>
										<span className="text-red-500"> *</span>
									</label>
									<Select
										required
										onValueChange={(value) => setPetSex(value)}
										defaultValue=""
									>
										<SelectTrigger className="border border-slate-400">
											<SelectValue placeholder="Select Pet's Sex" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Male">Male</SelectItem>
											<SelectItem value="Female">Female</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* pet birthdate */}
								<div className="w-full mt-4">
									<label
										htmlFor="birthdate"
										className="block text-sm font-medium text-raisin_black"
									>
										<span>Date of Birth</span>
										<span className="text-red-500"> *</span>
									</label>
									<Input
										type="date"
										id="birthdate"
										name="birthdate"
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="Tell us about yourself!"
										max={new Date().toISOString().split('T')[0]}
										required
										value={petBirthdate}
										onChange={(e) => setPetBirthdate(e.target.value)}
									/>
								</div>

								{/* pet birthplace */}
								<div className="w-full mt-4">
									<label
										htmlFor="location"
										className="block text-sm font-medium text-raisin_black"
									>
										<span>Birthplace</span>
										<span className="text-red-500"> *</span>
									</label>
									<Input
										type="text"
										id="location"
										value={petBirthplace}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${
											location === ''
												? ''
												: !checkLocation(petBirthplace)
												? 'border-red-500'
												: 'border-green-500'
										}`}
										placeholder="Where was your pet born?"
										required
										onFocus={() => setShowLocationTooltip(true)}
										onBlur={() => setShowLocationTooltip(false)}
										maxLength={30}
										minLength={1}
										onChange={(e) => setPetBirthplace(e.target.value)}
									/>

									{showLocationTooltip && (
										<div className="mt-4 flex flex-row w-full pl-2 gap-4">
											<div>
												<p
													className={`text-xs ${
														location.length >= 1 &&
														location.length <= 30
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- Be 2-30 characters long.
												</p>
												<p
													className={`text-xs ${
														/^[^\s]+(\s+[^\s]+)*$/.test(location)
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- No blank spaces on either ends.
												</p>
											</div>
										</div>
									)}
								</div>
							</div>

							<DialogFooter className="flex mt-6 md:flex-row flex-col gap-4">
								<DialogClose>
									<Button
										variant="secondary"
										type="button"
										onClick={() => {
											// reset all fields
											setPetName('')
											setPetPhotoURL('')
											setPetBreed('')
											setPetSex('')
											setPetAbout('')
											setPetBirthdate('')
											setPetBirthplace(location)
											setPetFavoriteFood('')
											setPetHobbies('')
											setPetPhotoPreviewUrl('/images/petPictureHolder.jpg')
										}}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button type="submit" disabled={submitDisabled}>
									Submit
								</Button>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
