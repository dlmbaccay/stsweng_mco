import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFlag, faImage } from "@fortawesome/free-solid-svg-icons"


const report_reason = [
    { label: "Inappropriate Content", value: "inappropriate content" },
    { label: "Spam", value: "spam" },
    { label: "Harassment", value: "harassment" },
    { label: "Violence", value: "violence" },
    { label: "Self-Injury", value: "self injury" },
    { label: "Hate Speech", value: "hate speech" },
    { label: "False Information", value: "false information" }
];

export function ReportPost({props}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { currentUser, post, postReports } = props;

    const [ reportReasons, setReportReasons] = useState([]);
    const [ reportOtherReasons, setReportOtherReasons ] = useState("");
    const [ reportDescription, setReportDescription ] = useState("");
    const [ reportedBy, setReportedBy ] = useState([currentUser.uid, currentUser.username ]);

    const reportPost = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Add report to post
            const reportData = {
                reportedBy: { uid: reportedBy[0], username: reportedBy[1]},
                reasons: reportReasons,
                otherReasons: reportOtherReasons,
                description: reportDescription,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: "pending",
                post: post
            };

            const response = await fetch("/api/posts/reported-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({reportData})
            });

            if (response.ok) {
                setLoading(false);
                toast.success("Post reported successfully");
            } else {
                // Assuming the API returns { message: '...' } on error
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
        } catch (error) {
            console.error("Error reporting post:", error.message);
            setLoading(false);
            toast.error(error.message);
        }
    };


    return (
        <Dialog>
            {/* Trigger Buttons */}
            <div className="flex flex-row items-center"> 
                <DialogTrigger asChild>
                    <div className="p-1.5 hover:text-primary text-secondary rounded-full aspect-square mx-auto cursor-pointer">
                        <FontAwesomeIcon icon={faFlag} className="w-5 h-5"></FontAwesomeIcon>
                    </div>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
                    
                <DialogHeader>
                    <DialogTitle className="text-center">Report a Post</DialogTitle>
                </DialogHeader>
                <hr className="border-b border-primary my-2 mx-4"/>
                <form onSubmit={reportPost}>
                    <div className="flex flex-col w-full mb-4">
                        {/* Report Reasons Section */}
                        <div className="flex flex-row w-full px-10 gap-12">
                            <div className="flex flex-col items-start w-full">
                                <Label className="my-4 w-full">Reasons for Reporting</Label>
                                <div className="grid grid-cols-2 gap-2 w-full mx-auto">
                                    {report_reason.map((reason, index) => (
                                        <Label
                                            className={`flex flex-row gap-2 border border-primary p-3 rounded-md items-center ${
                                                reportReasons?.includes(reason.value) ? "bg-primary text-secondary-foreground" : ""
                                            }`}
                                            key={index}
                                        >
                                            <div>
                                                <Checkbox
                                                    name="reasons"
                                                    checked={reportReasons?.includes(reason.value)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? setReportReasons([...reportReasons, reason.value])
                                                            : setReportReasons(reportReasons?.filter((value) => value !== reason.value));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <span>{reason.label}</span>
                                            </div>
                                        </Label>
                                    ))}
                                    <Label
                                        className={`flex flex-row gap-2 border border-primary p-3 rounded-md items-center ${
                                            reportReasons?.includes("others") ? "bg-primary text-secondary-foreground" : ""
                                        }`}
                                        key={7}
                                    >
                                        <div>
                                            <Checkbox
                                                name="reasons"
                                                checked={reportReasons?.includes("others")}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? setReportReasons([...reportReasons, "others"])
                                                        : setReportReasons(reportReasons?.filter((value) => value !== "others"));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <span>{"Other"}</span>
                                        </div>
                                    </Label>
                                </div>
                                {reportReasons?.includes("others") && (
                                    <div className="flex flex-col w-full">
                                        <Label className="my-4 w-full">Other Reasons</Label>
                                        <Input
                                            type="text"
                                            id="other-reasons"
                                            value={reportOtherReasons}
                                            className={`mb-4 p-2 rounded-md w-full`}
                                            placeholder={"Please specify..."}
                                            required
                                            maxLength={100}
                                            minLength={1}
                                            onChange={(e) => setReportOtherReasons(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                      

                        {/* Report Description Input */}
                        <div className="flex flex-col w-full px-10">
                            <div className="flex flex-col items-left w-full">
                                <Label className="my-4 w-full">Optional</Label>
                                <Textarea 
                                    type="text" 
                                    id="post-content" 
                                    value={reportDescription} 
                                    className={`mb-4 p-2 rounded-md w-full`} 
                                    placeholder={"Provide more details..."} 
                                    maxLength={400}
                                    minLength={1}
                                    onChange={(e) => setReportDescription(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className={`flex flex-row items-center`}>
                        <DialogClose>
                        Cancel
                            {/* <Button type="button" variant={"secondary"} className="mt-6">Cancel</Button> */}
                        </DialogClose>
                        {loading ? 
                            <Button disabled className={`mt-6`}>
                                <Loader2 className=" mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        :   <Button type="submit" className="mt-6">Report</Button>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
