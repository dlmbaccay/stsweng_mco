import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { updateDocument } from '@/lib/firestore-crud'
import { Button } from '@/components/ui/button'
import Loader from '../Loader'

export function FollowPetButton({ props }) {
	const [loading, setLoading] = useState(false)

	const { pet, currentUser_uid, currentUser_following } = props

	const handleFollow = async () => {
		setLoading(true)
		try {
			if (pet.followers && pet.followers.includes(currentUser_uid)) {
				await updateDocument('pets', pet.petID, {
					followers: pet.followers.filter((uid) => uid !== currentUser_uid),
				})
				await updateDocument('users', currentUser_uid, {
					following: currentUser_following.filter((uid) => uid !== pet.petID),
				})
				toast.success('Unfollowed ' + pet.petName)
			} else {
				await updateDocument('users', currentUser_uid, {
					following: [...currentUser_following, pet.petID],
				})
				await updateDocument('pets', pet.petID, {
					followers: [...pet.followers, currentUser_uid],
				})
				toast.success('Followed ' + pet.petName)
			}
		} catch (error) {
			console.error('Error following/unfollowing user:', error)
			toast.error('Error following/unfollowing user')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{loading ? (
				<Loader show={true} />
			) : (
				<Button
					onClick={handleFollow}
					className="px-3 h-[35px] bg-primary text-primary-foreground gap-2 flex items-center justify-center"
				>
					{pet.followers.includes(currentUser_uid) ? <p>Unfollow</p> : <p>Follow</p>}
				</Button>
			)}
		</>
	)
}
