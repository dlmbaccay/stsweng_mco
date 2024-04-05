import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { auth } from '@/lib/firebase'
import { checkPassword } from '@/lib/formats'
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
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

export function ChangePassword({ props }) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [isEdited, setIsEdited] = useState(false)

	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')

	const [showPasswordTooltip, setShowPasswordTooltip] = useState(false)
	const [showConfirmPasswordTooltip, setShowConfirmPasswordTooltip] = useState(false)

	// Function to update password
	const updatePassword = async () => {
		if (newPassword !== confirmNewPassword) {
			toast.error('Passwords do not match.')
			return
		}

		if (!checkPassword(newPassword)) {
			toast.error(
				'Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
			)
			return
		}

		try {
			setLoading(true)
			let credential = await EmailAuthProvider.credential(
				auth.currentUser.email,
				oldPassword, // Use the entered password
			)

			await reauthenticateWithCredential(auth.currentUser, credential)

			await auth.currentUser.updatePassword(newPassword)
			toast.success('Password updated successfully!')
			setOpen(false)
		} catch (error) {
			console.error('Error updating password:', error)
			toast.error('An error occurred while updating the password.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					disabled={
						auth.currentUser &&
						auth.currentUser.providerData[0].providerId !== 'password'
					}
					className="w-fit px-4"
				>
					Change Password
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
				<DialogHeader>
					<DialogTitle className="text-center">Change Password</DialogTitle>
				</DialogHeader>

				<div className="w-[80%] flex flex-col gap-6">
					{/* inputs */}
					<div className="flex flex-col items-center justify-center gap-4">
						{/* password */}
						<div className="w-full flex flex-col">
							<label className="font-semibold my-2">Old Password</label>
							<Input
								type="password"
								id="old-password"
								placeholder="Password"
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								className={`border border-slate-400 rounded-lg drop-shadow-sm ml-2`}
								required
							/>
							<label className="font-semibold my-2">New Password</label>
							<Input
								type="password"
								id="password"
								placeholder="Password"
								value={newPassword}
								required
								onFocus={() => setShowPasswordTooltip(true)}
								onBlur={() => setShowPasswordTooltip(false)}
								onChange={(e) => setNewPassword(e.target.value)}
								className={`border border-slate-400 rounded-lg drop-shadow-sm ml-2 ${
									newPassword === ''
										? ''
										: !checkPassword(newPassword)
										? 'border border-red-500'
										: 'border border-green-500'
								}`}
							/>

							{showPasswordTooltip && (
								<>
									<div className="mt-4 flex flex-row w-full pl-2 gap-4 text-[12px] text-start">
										<div className="w-2/3">
											<p
												className={`${
													/^.{8,16}$/.test(newPassword)
														? 'text-green-500'
														: 'text-slate-400'
												}`}
											>
												- Be 8-16 characters long.
											</p>
											<p
												className={`${
													/[A-Z]/.test(newPassword)
														? 'text-green-500'
														: 'text-slate-400'
												}`}
											>
												- Contain at least one uppercase letter.
											</p>
											<p
												className={`${
													/[a-z]/.test(newPassword)
														? 'text-green-500'
														: 'text-slate-400'
												}`}
											>
												- Contain at least one lowercase letter.
											</p>
										</div>
										<div className="w-fit">
											<p
												className={`${
													/[0-9]/.test(newPassword)
														? 'text-green-500'
														: 'text-slate-400'
												}`}
											>
												- Contain at least one digit.
											</p>
											<p
												className={`${
													/\W/.test(newPassword)
														? 'text-green-500'
														: 'text-slate-400'
												}`}
											>
												- Contain at least one special character.
											</p>
										</div>
									</div>
								</>
							)}
						</div>

						{/* confirm password */}
						<div className="w-full flex flex-col">
							<label className="font-semibold my-2">Confirm New Password</label>
							<Input
								type="password"
								required
								id="confirm_password"
								placeholder="Confirm Password"
								onFocus={() => setShowConfirmPasswordTooltip(true)}
								onBlur={() => setShowConfirmPasswordTooltip(false)}
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
								className={`border border-slate-400 rounded-lg drop-shadow-sm ml-2
                      ${
							confirmNewPassword === ''
								? ''
								: confirmNewPassword === newPassword
								? 'border border-green-500'
								: 'border border-red-500'
						}
                    `}
							/>

							{showConfirmPasswordTooltip &&
								(confirmNewPassword === '' ? null : confirmNewPassword ===
								  newPassword ? (
									<p className="mt-2 pl-2 text-xs text-green-500">
										Passwords match!
									</p>
								) : (
									<p className="mt-2 pl-2 text-xs text-red-500">
										Passwords do not match.
									</p>
								))}
						</div>
					</div>
				</div>
				<DialogFooter className={`items-center flex w-full flex-row justify-center gap-2`}>
					<DialogClose>
						<Button
							variant="outline"
							className="mt-6 hover:scale-110 transition-all duration-150 ease-in-out"
						>
							Cancel
						</Button>
					</DialogClose>
					{loading ? (
						<Button disabled>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</Button>
					) : (
						<Button type="button" onClick={updatePassword} className="mt-6">
							Change Password
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
