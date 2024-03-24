import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { uploadPostMedia } from "@/lib/storage-funcs";
import { firestore } from "@/lib/firebase";
import { createPostDocument } from "@/lib/firestore-crud";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export function CreatePost({ props }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const { uid, username, displayname, userphoto, pets } = props;

    const [postAuthorID, setPostAuthorID] = useState(uid);
    const [postAuthorUsername, setPostAuthorUsername] = useState(username);
    const [postAuthorDisplayName, setPostAuthorDisplayName] =
        useState(displayname);
    const [postAuthorPhotoURL, setPostAuthorPhotoURL] = useState(userphoto);
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("General");
    const [postTaggedPets, setPostTaggedPets] = useState([]);
    const [postImageURLs, setPostImageURLs] = useState([]);
    const [postTrackerLocation, setPostTrackerLocation] = useState("");

    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewMedia, setPreviewMedia] = useState([]);

    const handleSelectPets = (selectedPets) => {
        setPostTaggedPets(selectedPets);
    };
    const [selectedPetIDs, setSelectedPetIDs] = useState([]);

    const [displayValue, setDisplayValue] = useState("");

    const handleMediaFiles = (event) => {
        event.preventDefault();
        const files = event.target.files;
        if (files.length === 0) {
            setMediaFiles([]);
            setPreviewMedia([]);
        } else {
            const temp = handleImageFilePreview(files);
            if (temp === null) {
                setMediaFiles([]);
                setPreviewMedia([]);
            } else {
                setMediaFiles(temp[0]);
                setPreviewMedia(temp[1]);
            }
        }
    };

    const handleImageFilePreview = (files) => {
        const allowedTypes = ["image/jpeg", "image/png"]; // Add more types if needed
        const images = [];
        const previews = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (allowedTypes.includes(file.type)) {
                previews.push(URL.createObjectURL(file));
                images.push(file);
            } else {
                toast.alert(`File ${file.name} is not a valid image.`);
                return null;
            }
        }

        return [images, previews];
    };

    const createPost = async (event) => {
        event.preventDefault();

        // Check if post content is empty
        if (
            postContent === "" ||
            postContent === null ||
            postContent === undefined
        ) {
            toast.error("Post content cannot be empty.");
            return;
        }

        // store within postPets array the petIDs of the tagged pets
        const postPetIDs = [];
        postTaggedPets.forEach((pet) => {
            postPetIDs.push(pet.petID);
        });

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("postAuthorID", postAuthorID);
            formData.append("postAuthorUsername", postAuthorUsername);
            formData.append("postAuthorDisplayName", postAuthorDisplayName);
            formData.append("postAuthorPhotoURL", postAuthorPhotoURL);
            formData.append("postContent", postContent);
            formData.append("postCategory", postCategory);
            formData.append("postTaggedPets", JSON.stringify(postTaggedPets));
            formData.append("postPetIDs", JSON.stringify(postPetIDs));
            formData.append("postTrackerLocation", postTrackerLocation);
            formData.append("postType", "Original");
            for (const file of Array.from(mediaFiles)) {
                formData.append("files", file);
            }

            // Call API to create post
            await fetch("/api/posts/create-post", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then(async (data) => {
                    console.log(data);
                    setLoading(false);

                    toast.success("Post created successfully!");

                    setPostContent("");
                    setPostCategory("");
                    setPostTaggedPets([]);
                    setPostImageURLs([]);
                    setMediaFiles([]);
                    setPreviewMedia([]);
                    setSelectedPetIDs([]);
                    setPostTrackerLocation("");
                    setOpen(false);
                });
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error("Error creating post. Please try again later.");
        }
    };

    useEffect(() => {
        if (selectedPetIDs.length > 0) {
            const selectedPets = pets.filter((pet) =>
                selectedPetIDs.includes(pet.petID),
            );
            setPostTaggedPets(selectedPets);
            setDisplayValue(selectedPets.map((pet) => pet.petName).join(", "));
        }
    }, [selectedPetIDs, pets]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger Buttons */}
            <div className="flex flex-row items-center">
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-primary hover:border-primary hover:text-primary text-primary-foreground mx-4 flex h-[35px] w-11/12 items-center justify-center rounded-full hover:border-2 hover:bg-inherit"
                    >
                        What&apos;s on your mind?
                    </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-primary hover:border-primary hover:text-primary text-primary-foreground mx-auto aspect-square rounded-full p-1.5 hover:border-2 hover:bg-inherit"
                    >
                        <FontAwesomeIcon
                            icon={faImage}
                            className="h-5 w-5"
                        ></FontAwesomeIcon>
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Write a Post
                    </DialogTitle>
                </DialogHeader>
                <hr className="border-primary mx-4 my-2 border-b" />
                <form onSubmit={createPost}>
                    <div className="mb-4 flex w-full flex-col">
                        <div className="flex w-full flex-row gap-12 px-10">
                            {/* Post Category Select */}
                            <div className="flex w-2/5 flex-col items-center">
                                <Label
                                    htmlFor="category"
                                    className={"my-4 w-full"}
                                >
                                    {" "}
                                    Post Category{" "}
                                </Label>
                                <Select
                                    required
                                    onValueChange={(value) =>
                                        setPostCategory(value)
                                    }
                                    defaultValue="General"
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder="Select Category"
                                            className="text-muted-foreground"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">
                                            General
                                        </SelectItem>
                                        <SelectItem value="Q&A">Q&A</SelectItem>
                                        <SelectItem value="Tips">
                                            Tips
                                        </SelectItem>
                                        <SelectItem value="Pet Needs">
                                            Pet Needs
                                        </SelectItem>
                                        <SelectItem value="Milestones">
                                            Milestones
                                        </SelectItem>
                                        <SelectItem value="Lost Pets">
                                            Lost Pets
                                        </SelectItem>
                                        <SelectItem value="Unknown Owner">
                                            Unknown Owner
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Pet Tags Input */}
                            <div className="flex w-3/5 flex-col items-center">
                                <Label
                                    htmlFor="pets"
                                    className={"text-secondary my-4 w-full"}
                                >
                                    Tag your Pets!
                                </Label>
                                <MultiSelect
                                    options={pets.map((pet) => ({
                                        value: pet.petID,
                                        label: pet.petName,
                                    }))}
                                    selected={selectedPetIDs}
                                    onChange={setSelectedPetIDs}
                                    className={
                                        "text-secondary w-full rounded-md"
                                    }
                                />
                            </div>
                        </div>

                        {/* Conditional Location Input for Pet Tracker Categories */}
                        {(postCategory == "Lost Pets" ||
                            postCategory == "Unknown Owner") && (
                            <div className="flex w-full flex-col px-10">
                                <Label
                                    htmlFor="pet-location"
                                    className={"my-4 w-full"}
                                >
                                    Last Seen at{" "}
                                </Label>
                                <Input
                                    type="text"
                                    id="pet-location"
                                    required
                                    className={`w-full rounded-md p-2`}
                                    placeholder="Location"
                                    value={postTrackerLocation}
                                    onChange={(e) =>
                                        setPostTrackerLocation(e.target.value)
                                    }
                                />
                            </div>
                        )}

                        {/* Post Content Input */}
                        <div className="flex w-full flex-col px-10">
                            <div className="items-left flex w-full flex-col">
                                <Textarea
                                    type="text"
                                    id="post-content"
                                    value={postContent}
                                    className={`my-4 w-full rounded-md p-2`}
                                    placeholder={
                                        postCategory == "Lost Pets" ||
                                        postCategory == "Unknown Owner"
                                            ? "Provide more details..."
                                            : "What's on your mind?"
                                    }
                                    maxLength={400}
                                    minLength={1}
                                    onChange={(e) =>
                                        setPostContent(e.target.value)
                                    }
                                />
                            </div>
                            <div className="items-left flex w-full flex-col">
                                <Label
                                    htmlFor="media"
                                    className={"my-4 w-full"}
                                >
                                    Upload Media{" "}
                                </Label>
                                <Input
                                    id="media"
                                    type="file"
                                    multiple
                                    onChange={handleMediaFiles}
                                />
                                <div className="mt-4 flex w-full flex-row gap-2">
                                    {previewMedia.map((media, index) => (
                                        <Image
                                            key={index}
                                            src={media}
                                            alt={`Media ${index}`}
                                            width={80}
                                            height={80}
                                        />
                                    ))}
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
                                Create Post
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
