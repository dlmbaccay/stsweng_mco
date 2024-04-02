'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { auth, firestore } from '@/lib/firebase'
import { useCollection } from 'react-firebase-hooks/firestore'
import { handleDateFormat } from '@/lib/helper-functions'
import { ModeToggle } from '../mode-toggle'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faArrowRightFromBracket,
	faBell,
	faHandHoldingHeart,
	faHouse,
	faPaw,
	faUser,
	faBars,
	faUserGear,
} from '@fortawesome/free-solid-svg-icons'
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from '@/components/ui/dialog'

export default function NavBar({ props }) {
	const router = useRouter()
	const { uid, username, userPhotoURL, expand_lock } = props
	const [isExpanded, setIsExpanded] = useState(false)
	const activeTab = usePathname()

	const navRef = useRef(null)

	const handleSignOut = () => {
		auth.signOut().then(() => {
			router.push('/landing')
			toast.success('Signed out')
			console.log('Signed out')
		})
	}

	const [notifications, setNotifications] = useState([])
	const [loadingNotifications, setLoadingNotifications] = useState(false)
	const [lastVisibleNotification, setLastVisibleNotification] = useState(null)
	const [hasMoreNotifications, setHasMoreNotifications] = useState(true)

	useEffect(() => {
		const fetchNotifications = async () => {
			const firstBatch = firestore
				.collection('users')
				.doc(uid)
				.collection('notifications')
				.orderBy('date', 'desc')
				.limit(5)
			const documentSnapshots = await firstBatch.get()
			const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
			setLastVisibleNotification(lastVisible)
			const notifications = documentSnapshots.docs.map((doc) => doc.data())
			setNotifications(notifications)
			if (!(notifications.length > 0)) {
				setHasMoreNotifications(false)
			}
		}

		fetchNotifications()
	}, [uid])

	const fetchNextVisibleNotifications = (e) => {
		e.preventDefault()
		setLoadingNotifications(true)
		const nextBatch = firestore
			.collection('users')
			.doc(uid)
			.collection('notifications')
			.orderBy('date', 'desc')
			.startAfter(lastVisibleNotification)
			.limit(5)
		nextBatch.get().then((documentSnapshots) => {
			const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
			setLastVisibleNotification(lastVisible)
			const newNotifications = documentSnapshots.docs.map((doc) => doc.data())
			setNotifications([...notifications, ...newNotifications])
			setLoadingNotifications(false)
			if (documentSnapshots.docs.length < 5) {
				setHasMoreNotifications(false)
			}
		})
	}

	return (
		<>
			<div
				ref={navRef}
				className={`h-16 w-full px-4 grid grid-cols-3 justify-between bg-white dark:bg-dark_gray drop-shadow-lg pb-0.5`}
			>
				<>
					{/* Logo Left */}
					<div className="flex flex-row items-center justify-start">
						<Link
							className="group flex flex-row justify-center items-center gap-4"
							href={`/home`}
						>
							{
								<Image
									src={'/images/logo.png'}
									alt={'bantaybuddy logo'}
									width={44}
									height={44}
									className="rounded-full aspect-square object-cover"
									priority
								/>
							}
						</Link>
					</div>

					<div className="flex flex-row items-center md:justify-center justify-end">
						{/* Desktop View */}
						<div className={`hidden md:flex flex-row h-full gap-4 md:gap-8 lg:gap-12`}>
							{/* Home Button */}
							<Link
								href={`/home`}
								className={`px-8 transition-all duration-150 flex flex-row items-center gap-3 ${
									activeTab === '/home'
										? 'border-b-[3px] border-primary text-primary'
										: 'text-background hover:text-primary stroke-[50px] stroke-primary'
								}`}
							>
								<FontAwesomeIcon
									icon={faHouse}
									className={`w-6 h-6`}
								></FontAwesomeIcon>
							</Link>

							{/* Pet Tracker Button */}
							<Link
								href={`/pet-tracker`}
								className={`px-8 transition-all duration-150 flex flex-row items-center gap-3 ${
									activeTab === '/pet-tracker'
										? 'border-b-[3px] border-primary text-primary'
										: 'text-background hover:text-primary stroke-[50px] stroke-primary'
								}`}
							>
								<FontAwesomeIcon
									icon={faPaw}
									className={`w-6 h-6`}
								></FontAwesomeIcon>
							</Link>

							{/* Profile Button */}
							<Link
								href={`/user/${username}`}
								className={`px-8 transition-all duration-150 flex flex-row items-center gap-3 ${
									activeTab === '/user/' + username
										? 'border-b-[3px] border-primary text-primary'
										: 'text-background hover:text-primary stroke-[50px] stroke-primary'
								}`}
							>
								<FontAwesomeIcon
									icon={faUser}
									className={`w-6 h-6`}
								></FontAwesomeIcon>
							</Link>

							{/* Adoption Button */}
							<Link
								href={`/adopt`}
								className={`px-8 transition-all duration-150 flex flex-row items-center gap-3 ${
									activeTab === '/adopt'
										? 'border-b-[3px] border-primary text-primary'
										: 'text-background hover:text-primary stroke-[50px] stroke-primary'
								}`}
							>
								<FontAwesomeIcon
									icon={faHandHoldingHeart}
									className={`w-6 h-6`}
								></FontAwesomeIcon>
							</Link>
						</div>
						{/* Mobile View */}
						<div className={`flex md:hidden flex-row h-full`}>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<FontAwesomeIcon
										icon={faBars}
										className="w-6 h-6 text-primary"
									/>
								</DropdownMenuTrigger>

								<DropdownMenuContent className="text-lg p-4 pt-2">
									<DropdownMenuLabel>
										<div className="flex flex-col">Menu</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="bg-secondary" />
									<DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
										<Link
											href={`/home`}
											className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
										>
											<FontAwesomeIcon
												icon={faHouse}
												className={`w-6 h-6 ${
													activeTab === '/home'
														? 'text-primary'
														: 'text-background stroke-[50px] stroke-primary'
												}`}
											/>
											<p className="text-primary font-semibold tracking-wider">
												Home
											</p>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
										<Link
											href={`/pet-tracker`}
											className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
										>
											<FontAwesomeIcon
												icon={faPaw}
												className={`w-6 h-6 ${
													activeTab === '/pet-tracker'
														? 'text-primary'
														: 'text-background stroke-[50px] stroke-primary'
												}`}
											/>
											<span className="text-primary font-semibold tracking-wider">
												Pet Tracker
											</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
										<Link
											href={`/user/${username}`}
											className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
										>
											<FontAwesomeIcon
												icon={faUser}
												className={`w-6 h-6 ${
													activeTab === '/user/' + username
														? 'text-primary'
														: 'text-background stroke-[50px] stroke-primary'
												}`}
											/>
											<span className="text-primary font-semibold tracking-wider">
												Profile
											</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
										<Link
											href={`/adopt`}
											className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
										>
											<FontAwesomeIcon
												icon={faHandHoldingHeart}
												className={`w-6 h-6 ${
													activeTab === '/adopt'
														? 'text-primary'
														: 'text-background stroke-[50px] stroke-primary'
												}`}
											/>
											<span className="text-primary font-semibold tracking-wider">
												Adoption
											</span>
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Right End of Navbar */}
					<div className="flex flex-row items-center justify-end">
						{/* Notifications Button */}
						<Dialog>
							<DialogTrigger className="px-6">
								<div className="rounded-full">
									<FontAwesomeIcon
										icon={faBell}
										className="w-6 h-6 text-muted_blue dark:text-light_yellow"
									></FontAwesomeIcon>
								</div>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<h2 className="text-lg font-semibold text-gray-900">
										Notifications
									</h2>
								</DialogHeader>

								{notifications.length === 0 ? (
									<div className="flex flex-col items-center h-full justify-center gap-4 h-[50px]">
										<p className="text-center text-sm text-raisin">
											You have no notifications available.
										</p>
									</div>
								) : (
									<div className="flex flex-col gap-4 h-[450px] overflow-auto">
										{notifications.map((notification, index) => (
											<div className="flex items-center p-3 hover:bg-muted-foreground leading-3 ">
												<Link href={`/user/${notification.username}`}>
													<Image
														src={
															notification.userPhotoURL
																? notification.userPhotoURL
																: '/images/profilePictureHolder.jpg'
														}
														width={100}
														height={100}
														alt="user-image"
														className="w-12 h-12 mr-4 rounded-full hover:drop-shadow-lg cursor-pointer z-10"
													/>
												</Link>
												<Link
													href={'/post/' + notification.postID}
													key={index}
												>
													<div className="w-full">
														<div
															style={{ wordWrap: 'break-word' }}
															className=""
														>
															<Link
																href={`/user/${notification.username}`}
															>
																<span className="text-sm font-bold hover:drop-shadow-lg hover:text-base cursor-pointer">
																	{notification.displayname}
																</span>
															</Link>
															<span className="text-sm">
																{' '}
																{notification.action}
															</span>
														</div>
														<p className="mt-1 text-xs text-raisin">
															{handleDateFormat(notification.date)}
														</p>
													</div>
												</Link>
											</div>
										))}
									</div>
								)}

								<DialogFooter>
									{hasMoreNotifications && (
										<button onClick={(e) => fetchNextVisibleNotifications(e)}>
											Load More
										</button>
									)}
								</DialogFooter>
							</DialogContent>
						</Dialog>
						{/* Profile Dropdown Button */}
						<DropdownMenu>
							<DropdownMenuTrigger className="flex">
								<div className="w-fit flex">
									<Image
										src={
											userPhotoURL
												? userPhotoURL
												: '/images/profilePictureHolder.jpg'
										}
										alt={'profile picture'}
										width={44}
										height={44}
										className="rounded-full aspect-square object-cover"
									/>
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="mr-2 p-4 pt-2">
								<DropdownMenuLabel className="flex flex-row items-center justify-between">
									<div className="flex flex-col justify-start">
										My Account
										<span className="text-xs">@{username}</span>
									</div>
									<div className="flex flex-row items-center">
										<ModeToggle></ModeToggle>
									</div>
								</DropdownMenuLabel>

								<DropdownMenuSeparator className="bg-secondary" />

								<DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
									{/* Profile Button */}
									<Link
										href={`/user/${username}`}
										className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
									>
										<div className="p-1.5 rounded-full">
											<FontAwesomeIcon
												icon={faUser}
												className="w-6 h-6 text-primary"
											></FontAwesomeIcon>
										</div>
										<span className="text-primary font-semibold tracking-wider">
											View Profile
										</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
									{/* Settings Button */}
									<Link
										href={`/settings`}
										className="transition-all duration-300 flex flex-row items-center gap-3 w-full"
									>
										<div className="p-1.5 rounded-full">
											<FontAwesomeIcon
												icon={faUserGear}
												className="w-6 h-6 text-primary"
											></FontAwesomeIcon>
										</div>
										<span className="text-primary font-semibold tracking-wider">
											Settings
										</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-secondary" />
								<DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
									<button
										onClick={() => handleSignOut()}
										className={` transition-all duration-300 flex flex-row items-center gap-3`}
									>
										<div className="p-1.5 rounded-full">
											<FontAwesomeIcon
												icon={faArrowRightFromBracket}
												className="w-6 h-6 text-primary"
											></FontAwesomeIcon>
										</div>
										<span className="text-primary font-semibold whitespace-nowrap">
											Log Out
										</span>
									</button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</>
			</div>
		</>
	)
}
