import React from 'react'
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom'

const Header = () => {
	const navigate = useNavigate()
	const goApply = () => { console.log('[Header] Join With Us clicked'); navigate('/apply') }
	return (
		<div className='relative min-h-screen mb-4 bg-cover bg-center flex
		items-center w-full overflow-hidden'
		style={{ backgroundImage: "url('/home.jpg')" }} id='header'>

			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-linear-to-l from-black/90 via-black/60 to-transparent pointer-events-none z-0"></div>

			{/* Navbar */}
			<Navbar/>

			{/* Hero Content - right side, vertically centered */}
			<div className='relative z-10 w-full flex justify-end px-6 md:px-56 lg:px-76'>
				<div className='flex flex-col items-center text-center text-white max-w-xl'>
					<h2 className='text-5xl sm:text-6xl md:text-[56px] font-semibold leading-tight whitespace-nowrap'>
						Help Feed a Community
					</h2>
					<p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-md">
						NourishNet connects donors, NGOs, and communities to fight food insecurity. Donate surplus food and help create a hunger-free future.
					</p>
					<div className="mt-6">
						<button onClick={goApply} className="inline-block px-6 py-3 bg-[#66ada4] hover:bg-[#5aa798] rounded-full text-black font-semibold transition-colors">
							Join With Us
						</button>
					</div>
				</div>
			</div>

		</div>
	)
}

export default Header;
