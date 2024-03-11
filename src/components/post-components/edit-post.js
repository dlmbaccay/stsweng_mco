import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { fetchPostById, updatePost } from '@/lib/firebase';

export function EditPost({ postId }) {
    const { register, handleSubmit, setValue, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewMedia, setPreviewMedia] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await fetchPostById(postId);
                // Pre-populate form fields
                setValue('postContent', post.content);
                setValue('postCategory', post.category);
                setValue('postTaggedPets', post.taggedPets);
                setValue('postTrackerLocation', post.postTrackerLocation);
                
            } catch (error) {
                console.error('Failed to fetch post:', error);
            }
        };

        fetchPost();
    }, [postId, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await updatePost(postId, data);
            toast.success('Post updated successfully!');
            router.push('/'); // Redirect
        } catch (error) {
            toast.error('Failed to update post.');
        } finally {
            setLoading(false);
        }
    };

    const handleMediaFiles = (event) => {
        const files = event.target.files;
        const previews = Array.from(files).map(file => URL.createObjectURL(file));
        setMediaFiles(files);
        setPreviewMedia(previews);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Edit Post</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Label htmlFor="postContent">Post Content</Label>
                    <Textarea {...register('postContent')} placeholder="What's on your mind?" />

                    <Label htmlFor="postCategory">Post Category</Label>
                    <Select {...register('postCategory')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Q&A">Q&A</SelectItem>
                            <SelectItem value="Tips">Tips</SelectItem>
                            <SelectItem value="Pet Needs">Pet Needs</SelectItem>
                            <SelectItem value="Milestones">Milestones</SelectItem>
                            <SelectItem value="Lost Pets">Lost Pets</SelectItem>
                            <SelectItem value="Unknown Owner">Unknown Owner</SelectItem>
                        </SelectContent>
                    </Select>

                    

                    <Label htmlFor="postTrackerLocation">Last Seen at</Label>
                    <Input {...register('postTrackerLocation')} placeholder="Location" />

                    <Label htmlFor="media">Upload Media</Label>
                    <Input type="file" multiple onChange={handleMediaFiles} />
                    <div className="flex flex-row gap-2">
                        {previewMedia.map((media, index) => (
                            <img key={index} src={media} alt={`Media ${index}`} width={80} height={80} />
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Post'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
