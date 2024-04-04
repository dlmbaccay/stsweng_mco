import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RoundImage from '@/components/round-image'
import Loader from '../Loader'

export function EditUserProfile({ props }) {
	const [loading, setLoading] = useState(false)

	const {
		uid,
		displayName,
		userPhotoURL,
		coverPhotoURL,
		about,
		location,
		gender,
		birthdate,
		phoneNumber,
	} = props

	const [newDisplayName, setNewDisplayName] = useState(displayName)
	const [newUserPhotoUrl, setNewUserPhotoUrl] = useState(userPhotoURL)
	const [newCoverPhotoUrl, setNewCoverPhotoUrl] = useState(coverPhotoURL)
	const [newAbout, setNewAbout] = useState(about)
	const [newLocation, setNewLocation] = useState(location)
	const [newGender, setNewGender] = useState(gender)
	const [newBirthdate, setNewBirthdate] = useState(birthdate)
	const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber)

	const [showDisplayNameTooltip, setShowDisplayNameTooltip] = useState(false)
	const [showLocationTooltip, setShowLocationTooltip] = useState(false)

	const [userPhoto, setUserPhoto] = useState('')
	const [coverPhoto, setCoverPhoto] = useState('')
	const [previewUrl, setPreviewUrl] = useState(userPhotoURL)
	const [coverPreviewUrl, setCoverPreviewUrl] = useState(coverPhotoURL)

	const handleUserPhotoChange = (event) => {
		var temp = handleImageFilePreview(event.target.files[0])
		if (temp == null) {
			setUserPhoto('')
			setPreviewUrl('/images/profilePictureHolder.jpg')
		} else {
			setUserPhoto(temp[0])
			setPreviewUrl(temp[1])
		}
	}

	const handleCoverPhotoChange = (event) => {
		var temp = handleImageFilePreview(event.target.files[0])
		if (temp == null) {
			setCoverPhoto('')
			setCoverPreviewUrl('/images/coverPhotoHolder.jpg')
		} else {
			setCoverPhoto(temp[0])
			setCoverPreviewUrl(temp[1])
		}
	}

	const handleSaveProfileChanges = async (event) => {
		event.preventDefault()
		setLoading(true)
		try {
			let newPhotoUrl
			let newCoverUrl

			// Photo Upload
			if (userPhoto) {
				// Upload user photo
				const photoData = await uploadFile('uploadProfile', uid, userPhoto)
				newPhotoUrl = photoData.url
			}

			// Cover Upload
			if (coverPhoto) {
				// Upload cover photo
				const coverData = await uploadFile('uploadCover', uid, coverPhoto)
				newCoverUrl = coverData.url
			}

			// Save User Data
			await saveUserData(
				newPhotoUrl ? newPhotoUrl : userPhotoURL,
				newCoverUrl ? newCoverUrl : coverPhotoURL,
			)
			setLoading(false)
			toast.success('Profile changes saved!')
		} catch (error) {
			console.error(error)
			setLoading(false)
			toast.error('An error occurred while updating your profile.')
		}
	}

	async function uploadFile(action, userId, file) {
		const formData = new FormData()
		formData.append('action', action)
		formData.append('user', userId)
		formData.append('file', file)

		const response = await fetch('/api/user-setup/upload-file', {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			throw new Error('Failed to upload file')
		}

		const data = await response.json()
		return data
	}

	async function saveUserData(photoURL, coverURL) {
		await fetch('/api/users/update-data', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'updateUserData',
				uid,
				displayName: newDisplayName,
				userPhotoURL: photoURL,
				coverPhotoURL: coverURL,
				about: newAbout,
				location: newLocation,
				gender: newGender,
				birthdate: newBirthdate,
				phoneNumber: newPhoneNumber,
			}),
		})
			.then((response) => {
				if (response.ok) {
					const data = response.json()
					if (data.success) {
						toast.success(`Successfully updated profile details!`)
					}
				} else {
					throw new Error('Failed to save user data')
				}
			})
			.finally(() => {
				window.location.reload()
			})
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="px-3 h-[35px]  gap-2 flex items-center justify-center">
					<i className="fa-solid fa-pencil" />
					Edit Profile
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] lg:max-w-[1080px] h-[600px] md:h-auto  overflow-auto">
				<>
					<DialogHeader>
						<DialogTitle>Edit Profile Information</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSaveProfileChanges}>
						<div className="flex md:flex-row flex-col w-full mb-4">
							<div className="flex flex-col items-center md:w-1/3 w-full p-4">
								<div className="flex flex-col items-center">
									<Label htmlFor="user-photo" className="text-center text-md">
										<span className="">Change Profile Picture</span>
										<div className="mt-4">
											<RoundImage
												src={
													previewUrl
														? previewUrl
														: '/images/profilePictureHolder.jpg'
												}
												alt="Profile Picture"
												className="rounded-full object-cover cursor-pointer"
											/>
										</div>
									</Label>
									<Input
										type="file"
										onChange={handleUserPhotoChange}
										id="user-photo"
										className="mt-4 w-full border-muted-foreground"
									/>

									<Label
										htmlFor="cover-photo"
										className="text-center text-md mt-4"
									>
										<span className="">Change Cover Photo</span>
										<div className="mt-4 w-64 h-36 relative">
											<Image
												src={
													coverPreviewUrl
														? coverPreviewUrl
														: '/images/coverPhotoHolder.png'
												}
												alt="Cover Photo"
												layout="fill"
												className="rounded-lg object-cover hover:object-scale-down transition-all delay-300 cursor-pointer"
											/>
										</div>
									</Label>
									<Input
										type="file"
										onChange={handleCoverPhotoChange}
										id="cover-photo"
										className="mt-4 w-full border-muted-foreground"
									/>
								</div>
							</div>
							<div className="flex flex-col md:w-2/3 w-full md:px-20 px-4">
								<div className="flex flex-col items-left">
									<Label
										htmlFor="display-name"
										className="text-left text-lg font-normal"
									>
										Display Name
									</Label>
									<Input
										type="text"
										id="display-name"
										value={newDisplayName}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${
											newDisplayName === ''
												? ''
												: !checkDisplayName(newDisplayName)
												? 'border-red-500'
												: 'border-green-500'
										}`}
										placeholder="What would you like us to call you?"
										required
										onFocus={() => setShowDisplayNameTooltip(true)}
										onBlur={() => setShowDisplayNameTooltip(false)}
										maxLength={30}
										minLength={1}
										onChange={(e) => setNewDisplayName(e.target.value)}
									/>

									{showDisplayNameTooltip && (
										<div className="mt-4 flex flex-row w-full pl-2 gap-4">
											<div>
												<p
													className={`text-xs ${
														newDisplayName.length >= 1 &&
														newDisplayName.length <= 30
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- Be 1-30 characters long.
												</p>
												<p
													className={`text-xs ${
														/^[^\s]+(\s+[^\s]+)*$/.test(newDisplayName)
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- No blank spaces on either ends.
												</p>
											</div>
										</div>
									)}

									<Label
										htmlFor="location"
										className="text-left text-lg font-normal mt-2"
									>
										Location
									</Label>
									<Input
										type="text"
										id="location"
										value={newLocation}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${
											newLocation === ''
												? ''
												: !checkLocation(newLocation)
												? 'border-red-500'
												: 'border-green-500'
										}`}
										placeholder="Where do you live?"
										required
										onFocus={() => setShowLocationTooltip(true)}
										onBlur={() => setShowLocationTooltip(false)}
										maxLength={30}
										minLength={1}
										onChange={(e) => setNewLocation(e.target.value)}
									/>

									{showLocationTooltip && (
										<div className="mt-4 flex flex-row w-full pl-2 gap-4">
											<div>
												<p
													className={`text-xs ${
														newLocation.length >= 1 &&
														newLocation.length <= 30
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- Be 1-30 characters long.
												</p>
												<p
													className={`text-xs ${
														/^[^\s]+(\s+[^\s]+)*$/.test(newLocation)
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- No blank spaces on either ends.
												</p>
											</div>
										</div>
									)}
									<Label
										htmlFor="about"
										className="text-left text-lg font-normal mt-2"
									>
										About
									</Label>
									<Textarea
										type="text"
										id="about"
										value={newAbout}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="Tell us about yourself!"
										maxLength={100}
										minLength={1}
										onChange={(e) => setNewAbout(e.target.value)}
									/>
									<div className="mt-4">
										{/* Gender */}
										<div className="flex flex-row mt-2 items-center">
											<p className="text-base tracking-wide font-semibold w-1/3">
												Gender
											</p>
											<Select
												required
												onValueChange={(value) => setNewGender(value)}
												defaultValue={newGender}
											>
												<SelectTrigger className="border border-slate-400">
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Male">Male</SelectItem>
													<SelectItem value="Female">Female</SelectItem>
													<SelectItem value="Non-Binary">
														Non-Binary
													</SelectItem>
													<SelectItem value="Prefer not to Say">
														Prefer Not to Say
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Birthday */}
										<div className="flex flex-row mt-2 items-center">
											<p className="text-base tracking-wide font-semibold w-1/3">
												Birthday
											</p>
											<Input
												type="date"
												id="birthdate"
												name="birthdate"
												className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
												placeholder="Tell us about yourself!"
												// max="9999-12-31"
												max={new Date().toISOString().split('T')[0]}
												required
												value={newBirthdate}
												onChange={(e) => setNewBirthdate(e.target.value)}
											/>
										</div>

										{/* Phone Number */}
										<div className="flex flex-row mt-2 items-center">
											<p className="text-base tracking-wide font-semibold w-1/3">
												Phone Number
											</p>
											<PhoneInput
												defaultCountry="PH"
												value={newPhoneNumber}
												onChange={setNewPhoneNumber}
												className={`border border-slate-400 mt-2 rounded-md w-full`}
												placeholder="Enter your phone number"
												required
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						<DialogFooter>
							{loading ? (
								<Button disabled>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</Button>
							) : (
								<Button type="submit" className="mt-6">
									Save Changes
								</Button>
							)}
						</DialogFooter>
					</form>
				</>
			</DialogContent>
		</Dialog>
	)
}
