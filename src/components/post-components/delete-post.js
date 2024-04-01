import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
  
export function DeletePost({postID}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleDeletePost = async (e) => {
      e.preventDefault();
        try {
          toast.loading('Deleting post...');
          // Logic to delete the post from your database (Firestore, etc.)
          const response = await fetch(`/api/posts/delete-post`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postID }),
          });
      
          if (response.ok) {
            toast.dismiss();
            toast.success('Post deleted successfully!');
            window.location.reload();
            // Additional actions, if needed (e.g., refresh data)
          } else {
            toast.dismiss();
            toast.error('Error deleting post. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          toast.dismiss();
          toast.error('An error occurred while deleting the post.');
        } 
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <i
                    id="delete-control"
                    className="fa-solid fa-trash hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all"
                />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <div 
                      className='bg-muted_blue text-off_white dark:bg-light_yellow dark:text-black hover:bg-black hover:text-off_white dark:hover:bg-off_white dark:hover:text-black transition-all font-semibold text-sm flex items-center justify-center px-4 py-2 rounded-md cursor-pointer'
                      onClick={(e) => handleDeletePost(e)}
                    >Delete</div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
  }
  