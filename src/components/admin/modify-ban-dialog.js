import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { updateDocument } from '@/lib/firestore-crud'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import { handleDateFormat } from '@/lib/helper-functions'

export function ModifyBan({ props }) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [isEdited, setIsEdited] = useState(false)

	const { user } = props

	const [newBanStatus, setNewBanStatus] = useState(user.ban.status)
	const [newBanDuration, setNewBanDuration] = useState(user.ban.until ? user.ban.until : null)

	const handleModifyBan = async (event) => {
		event.preventDefault()
		setLoading(true)
		try {
			// Save User Data
			await saveBanData()
			setLoading(false)
			toast.success('User ban modified.')
			setOpen(false)
		} catch (error) {
			console.error(error)
			setLoading(false)
			toast.error('An error occurred while modifying user ban.')
		}
	}

	async function saveBanData() {
		if (newBanStatus === 'temporary') {
			if (newBanDuration === user.ban.until) {
				return
			} else {
				const banData = {
					status: newBanStatus,
					when: user.ban.when,
					until: newBanDuration,
				}
				await updateDocument('users', user.uid, { ban: banData })
			}
		} else {
			const banData = {
				status: newBanStatus,
				when: user.ban.when,
				until: null,
			}
			await updateDocument('users', user.uid, { ban: banData })
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					className={`w-36 text-lg font-semibold tracking-wide bg-inherit border border-secondary shadow-lg text-secondary hover:text-primary-foreground`}
				>
					Modify Ban
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
				<DialogHeader>
					<DialogTitle className="text-center">Modify Ban</DialogTitle>
				</DialogHeader>
				<hr className="border-b border-muted_blue dark:border-light_yellow my-2 mx-4" />
				<form onSubmit={handleModifyBan}>
					<div className="flex flex-col w-full mb-4">
						<div className="flex flex-col w-full px-10">
							<div className="flex flex-row items-center justify-start w-full">
								<Label htmlFor="post-content" className="text-lg w-1/4">
									Ban Type:
								</Label>
								<Select
									required
									onValueChange={(value) => setNewBanStatus(value)}
									value={newBanStatus}
								>
									<SelectTrigger className="w-3/4">
										<SelectValue placeholder="Select Ban Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="temporary">Temporary</SelectItem>
										<SelectItem value="permanent">Permanent</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="mt-4 flex flex-col w-full">
								<Label htmlFor="ban-until" className="text-lg mb-2">
									Ban Until:{' '}
									{newBanStatus === 'temporary' && newBanDuration !== null
										? handleDateFormat(newBanDuration.toDate())
										: 'N/A'}
								</Label>
								{newBanStatus === 'temporary' && (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant={'outline'}
												className={`w-[280px] justify-start text-left font-normal ${
													!newBanDuration && 'text-muted-foreground'
												}`}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{newBanDuration ? (
													handleDateFormat(newBanDuration.toDate())
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={newBanDuration}
												onSelect={setNewBanDuration}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								)}
							</div>
						</div>
					</div>
					<DialogFooter className={`flex flex-row items-center`}>
						<DialogClose className="items-center border border-secondary mt-6 p-2 rounded-lg hover:bg-muted hover:scale-110 transition-all duration-300">
							Cancel
						</DialogClose>
						{loading ? (
							<Button disabled className={`mt-6`}>
								<Loader2 className=" mr-2 h-4 w-4 animate-spin" />
								Please wait
							</Button>
						) : (
							<Button
								type="submit"
								className="mt-6 hover:scale-110 transition-all duration-300"
							>
								Modify Ban
							</Button>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
