import Image from 'next/image';
import Link from 'next/link';
export default function NotFoundPage() {
  
  
  return (
    <div class="flex lg:flex-row max-sm:flex-col h-screen px-4 bg-snow justify-center items-center lg:gap-10 max-sm:gap-0">
      <Image src='/images/error.png' alt='error' width={300} height={300} className='max-sm:h-72 max-sm:w-auto'/>
      <div className='mt-20 max-sm:text-center max-sm:mt-3'>
          <h1 className="font-black text-gray-200 text-9xl max-sm:text-5xl">404</h1>
          <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Oops!</p>
          <p className="mt-4 max-sm:mt-2 text-raisin_black">We can&apos;t find that page.</p>
          <Link href={"/home"} className="mt-6 max-sm:mt-3">
          <button type="button" className="w-fit px-5 py-3 mt-6 max-sm:mt-3 text-shining text-sm font-medium bg-primary text-secondary-foreground rounded-md hover:scale-110 transition-all focus:outline-none focus:ring">
            Go back to home</button>
          </Link>
      </div>
        
    </div>
  )
}