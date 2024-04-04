import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog'
import RoundImage from './round-image'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import toast from 'react-hot-toast'
import { set } from 'date-fns'
import Link from 'next/link'

export function PetSnippetCard({ props }) {
	const router = useRouter()
	const { petName, petBreed, petPhotoURL, petID } = props

	return (
		<Link href={`/pet/${petID}`} className="block md:w-[30%] w-fit h-full">
			<Card
				className="mb-4 flex flex-col gap-2 items-center justify-center w-full h-[200px] hover:bg-white dark:hover:bg-dark_gray px-6 py-4 hover:drop-shadow-md transition-all hover:scale-105 cursor-pointer"
				onClick={() => {
					router.push(`/pet/${petID}`)
				}}
			>
				<Image
					src={petPhotoURL == '' ? '/images/petPictureHolder.jpg' : petPhotoURL}
					alt="pet photo"
					width={100}
					height={100}
					className="rounded-full aspect-square object-cover"
				/>
				<div className="flex flex-col items-center justify-center">
					<p className="xl:text-sm text-lg font-bold">{petName}</p>
					<p className="text-sm italic text-center">{petBreed}</p>
				</div>
			</Card>
		</Link>
	)
}
