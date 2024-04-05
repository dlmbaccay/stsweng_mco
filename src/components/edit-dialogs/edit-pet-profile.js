import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RoundImage from '@/components/round-image'
import { useRouter } from 'next/navigation'

export function EditPetProfile({ props }) {
	const router = useRouter()
	const [saveLoading, setSaveLoading] = useState(false)
	const { petData, currentUser } = props

	const [newPetName, setNewPetName] = useState(petData.petName)
	const [newPetAbout, setNewPetAbout] = useState(petData.petAbout)
	const [newPetHobbies, setNewPetHobbies] = useState(petData.petHobbies)
	const [newPetFavoriteFood, setNewPetFavoriteFood] = useState(petData.petFavoriteFood)

	const [petPhoto, setPetPhoto] = useState('')
	const [previewUrl, setPreviewUrl] = useState(petData.petPhotoURL)

	const [showDisplayNameTooltip, setShowDisplayNameTooltip] = useState(false)

	async function handleUserPhotoChange(event) {
		var temp = handleImageFilePreview(event.target.files[0])
		if (temp == null) {
			setPetPhoto('')
			setPreviewUrl('images/petPictureHolder.jpg')
		} else {
			setPetPhoto(temp[0])
			setPreviewUrl(temp[1])
		}
	}

	async function handleSaveProfileChanges(event) {
		event.stopPropagation()
		event.preventDefault()
		setSaveLoading(true)
		toast.loading('Saving profile changes...')

		try {
			let newPhotoUrl

			// photo upload
			if (petPhoto) {
				const photoData = await uploadFile('uploadPetProfile', petData.petID, petPhoto)
				newPhotoUrl = photoData.photoURL
			}

			// save pet data
			await savePetData(newPhotoUrl ? newPhotoUrl : petData.petPhotoURL)
			setSaveLoading(false)
			toast.dismiss()
			toast.success('Successfully updated profile details!')
			router.refresh()
		} catch (error) {
			console.error('Error saving pet data: ', error)
			setSaveLoading(false)
			toast.dismiss()
			toast.error('Failed to save pet data')
		}
	}

	async function uploadFile(action, petID, file) {
		const formData = new FormData()
		formData.append('action', action)
		formData.append('pet', petID)
		formData.append('file', file)

		const response = await fetch('/api/pet-setup/upload-file', {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			throw new Error('Failed to upload file')
		}

		const data = await response.json()
		return data
	}

	async function savePetData(photoURL) {
		await fetch('/api/pets/update-data', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'updatePetData',
				petID: petData.petID,
				petName: newPetName,
				petAbout: newPetAbout,
				petHobbies: newPetHobbies,
				petFavoriteFood: newPetFavoriteFood,
				petPhotoURL: photoURL,
			}),
		}).then((response) => {
			if (response.ok) {
				const data = response.json()
				if (data.success) {
					toast.success('Successfully updated profile details!')
				}
			} else {
				throw new Error('Failed to save pet data')
			}
		})
	}

	return (
		<Dialog>
			<DialogTrigger>
				<Button className="px-3 h-[35px] gap-2 flex items-center justify-center">
					<i class="fa-solid fa-pencil" />
					Edit Profile
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[600px] lg:max-w-[1080px]">
				<>
					<DialogHeader>
						<DialogTitle>Edit Pet Profile Information</DialogTitle>
						<DialogDescription>
							Make changes to your pet&apos;s profile here. Click save when
							you&apos;re done.
						</DialogDescription>
					</DialogHeader>

					<form>
						<div className="flex flex-row w-full mb-4">
							<div className="flex flex-col items-center w-1/3 mt-4 mb-2">
								{/* Change Profile Picture */}
								<div className="flex flex-col items-center">
									<Label htmlFor="pet-photo" className="text-center text-md">
										<span className="cursor-pointer">
											Change Profile Picture
										</span>
										<div className="mt-4 cursor-pointer hover:opacity-60">
											<RoundImage
												src={
													previewUrl
														? previewUrl
														: '/images/petPictureHolder.jpg'
												}
												alt="Profile Picture"
												className="rounded-full object-cover"
											/>
										</div>
									</Label>
									<Input
										type="file"
										className="hidden"
										onChange={handleUserPhotoChange}
										id="pet-photo"
									/>
								</div>

								{/* Sex, Breed, Birthdate, Birthplace */}
								<div className="flex flex-col items-start gap-2 mt-10 bg-black p-6 rounded-lg">
									<div className="flex items-center justify-center gap-1">
										<i className="flex items-center justify-center w-[20px] fa-solid fa-venus-mars" />
										<span>{petData.petSex}</span>
									</div>

									<div className="flex items-center justify-center gap-1">
										<i className="flex items-center justify-center w-[20px] fa-solid fa-paw" />
										<span>{petData.petBreed}</span>
									</div>

									<div className="flex items-center justify-center gap-1">
										<i className="flex items-center justify-center w-[20px] fa-solid fa-cake-candles" />
										<span>{petData.petBirthdate}</span>
									</div>

									<div className="flex items-center justify-center gap-1">
										<i className="flex items-center justify-center w-[20px] fa-solid fa-location-dot" />
										<span>{petData.petBirthplace}</span>
									</div>
								</div>
							</div>

							{/* Pet Name, About, Hobbies, Favorite Food */}
							<div className="flex flex-col w-2/3 px-20">
								{/* Pet Name */}
								<div className="flex flex-col items-left">
									<Label
										htmlFor="pet-name"
										className="text-left text-lg font-normal"
									>
										Pet Name
									</Label>
									<Input
										type="text"
										id="pet-name"
										value={newPetName}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${
											newPetName === ''
												? ''
												: !checkDisplayName(newPetName)
												? 'border-red-500'
												: 'border-green-500'
										}`}
										placeholder="What's the name of your pet?"
										required
										onFocus={() => setShowDisplayNameTooltip(true)}
										onBlur={() => setShowDisplayNameTooltip(false)}
										maxLength={30}
										minLength={1}
										onChange={(e) => setNewPetName(e.target.value)}
									/>

									{showDisplayNameTooltip && (
										<div className="mt-4 flex flex-row w-full pl-2 gap-4">
											<div>
												<p
													className={`text-xs ${
														newPetName.length >= 1 &&
														newPetName.length <= 30
															? 'text-green-500'
															: 'text-slate-400'
													}`}
												>
													- Be 1-30 characters long.
												</p>
												<p
													className={`text-xs ${
														/^[^\s]+(\s+[^\s]+)*$/.test(newPetName)
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

								{/* Pet About */}
								<div className="mt-4">
									<Label
										htmlFor="about"
										className="text-left text-lg font-normal mt-2"
									>
										About
									</Label>
									<Textarea
										type="text"
										id="about"
										value={newPetAbout}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="Tell us about yourself!"
										maxLength={100}
										minLength={1}
										onChange={(e) => setNewPetAbout(e.target.value)}
									/>
								</div>

								{/* Pet Favorite Food */}
								<div className="mt-4">
									<Label
										htmlFor="favorite_food"
										className="text-left text-lg font-normal mt-2"
									>
										Favorite Food
									</Label>
									<Input
										type="text"
										id="pet-name"
										value={newPetFavoriteFood}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="What would you like us to call you?"
										onChange={(e) => setNewPetFavoriteFood(e.target.value)}
									/>
								</div>

								{/* Pet Hobbies */}
								<div className="mt-4">
									<Label
										htmlFor="hobbies"
										className="text-left text-lg font-normal mt-2"
									>
										Hobbies
									</Label>
									<Input
										type="text"
										id="pet-name"
										value={newPetHobbies}
										className={`border border-slate-400 mt-2 p-2 rounded-md w-full`}
										placeholder="What would you like us to call you?"
										onChange={(e) => setNewPetHobbies(e.target.value)}
									/>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-end">
							{/* Cancel and Save */}
							<DialogFooter className="flex w-1/4">
								<DialogClose asChild>
									<Button
										variant="secondary"
										type="button"
										className="w-1/2"
										onClick={() => {
											console.log('Cancel')
										}}
									>
										Cancel
									</Button>
								</DialogClose>

								<Button
									onClick={handleSaveProfileChanges}
									className={`w-1/2 ${saveLoading ? 'cursor-not-allowed' : ''}`}
									disabled={saveLoading}
								>
									Save
								</Button>
							</DialogFooter>
						</div>
					</form>
				</>
			</DialogContent>
		</Dialog>
	)
}
