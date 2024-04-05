import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { updateDocument } from '@/lib/firestore-crud'
import { Button } from '@/components/ui/button'
import Loader from '../Loader'

export function FollowUserButton({ props }) {
	const [loading, setLoading] = useState(false)

	const {
		profileUser_pets,
		profileUser_uid,
		profileUser_name,
		currentUser_uid,
		profileUser_followers,
		currentUser_following,
	} = props

	const handleFollow = async () => {
		setLoading(true)
		try {
			if (profileUser_followers && profileUser_followers.includes(currentUser_uid)) {
				await updateDocument('users', profileUser_uid, {
					followers: profileUser_followers.filter((uid) => uid !== currentUser_uid),
				})
				await updateDocument('users', currentUser_uid, {
					following: currentUser_following.filter((uid) => uid !== profileUser_uid),
				})
				toast.success('Unfollowed ' + profileUser_name)
			} else {
				const newFollowers = [...profileUser_followers, currentUser_uid]
				let newFollowing = [...currentUser_following, profileUser_uid]
				await updateDocument('users', profileUser_uid, { followers: newFollowers })
				await updateDocument('users', currentUser_uid, { following: newFollowing })
				profileUser_pets.forEach(async (pet) => {
					if (!pet.followers.includes(currentUser_uid)) {
						newFollowing = [...newFollowing, pet.petID]
						await updateDocument('pets', pet.petID, {
							followers: [...pet.followers, currentUser_uid],
						})
						await updateDocument('users', currentUser_uid, { following: newFollowing })
					}
				})
				toast.success('Followed ' + profileUser_name + ' and their pets')
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
					{profileUser_followers && profileUser_followers.includes(currentUser_uid) ? (
						<p>Unfollow</p>
					) : (
						<p>Follow</p>
					)}
				</Button>
			)}
		</>
	)
}
