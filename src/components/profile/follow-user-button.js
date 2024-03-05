import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { handleImageFilePreview } from "@/lib/helper-functions"
import { checkDisplayName, checkLocation } from "@/lib/formats"
import { firestore } from "@/lib/firebase"
import { updateDocument} from "@/lib/firestore-crud"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import RoundImage from "@/components/round-image"
import Loader from "../Loader"


export function FollowButton({props}) {
    const [loading, setLoading] = useState(false);

    const { profileUser_uid, profileUser_name, currentUser_uid, profileUser_followers, currentUser_following } = props;

    const handleFollow = async () => {
        setLoading(true);
        try {
            if (profileUser_followers.includes(currentUser_uid)) {
                await updateDocument('users', profileUser_uid, {followers: profileUser_followers.filter(uid => uid !== currentUser_uid)});
                await updateDocument('users', currentUser_uid, {following: currentUser_following.filter(uid => uid !== profileUser_uid)});
                toast.success("Unfollowed " + profileUser_name);
            } else {
                await updateDocument('users', profileUser_uid, {followers: [...profileUser_followers, currentUser_uid]});
                await updateDocument('users', currentUser_uid, {following: [...currentUser_following, profileUser_uid]});
                toast.success("Followed " + profileUser_name);
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
            toast.error('Error following/unfollowing user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        {loading ? <Loader show={true} /> : 
            <Button onClick={handleFollow} className="px-3 h-[35px] bg-primary text-primary-foreground gap-2 flex items-center justify-center">
                {profileUser_followers.includes(currentUser_uid) ? (
                    <p>Unfollow</p>
                ) : (
                    <p>Follow</p>
                )}
            </Button>
        }
        </>
    )
}
