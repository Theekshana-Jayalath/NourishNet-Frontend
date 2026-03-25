import React from 'react'
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom'

const Header = () => {
	const navigate = useNavigate()
	const goApply = () => { console.log('[Header] Join With Us clicked'); navigate('/apply') }
	return (<>
		<div className='relative min-h-screen bg-cover bg-center flex items-center w-full overflow-hidden'
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

		{/* About section */}
		<section id='about' className='bg-white w-full min-h-screen flex items-center scroll-mt-20'>
		  <div className='max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
		    <div className='w-full'>
		      <img src='/about-food.jpg' alt='Food donation' className='w-full rounded-lg shadow' />
		    </div>
		    <div className='w-full'>
		      <h3 className='text-2xl font-bold text-[#004b49] mb-4'>About NourishNet</h3>
		      <p className='text-gray-700 mb-4'>NourishNet connects donors, NGOs, and drivers in real-time to redistribute surplus food to communities in need. Our platform makes it simple for organizations and individuals to donate, coordinate, and track deliveries to ensure food reaches people quickly and safely.</p>
		      <ul className='list-disc pl-5 space-y-2 text-gray-700'>
		        <li>Reduce food waste</li>
		        <li>Support communities</li>
		        <li>Real-time coordination</li>
		      </ul>
		    </div>
		  </div>
		</section>

		{/* Contact section */}
		<section id='contact' className='bg-white w-full min-h-screen flex items-center scroll-mt-20'>
		  <div className='max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8'>
		    <div>
		      <h3 className='text-2xl font-bold text-[#004b49] mb-4'>Contact Us</h3>
		      <p className='text-gray-700 mb-4'>Reach out for partnerships, donations or general inquiries.</p>
		      <div className='text-sm text-gray-700 space-y-3'>
		        <div><strong>Address:</strong> 123 Community Lane, City, Country</div>
		        <div><strong>Email:</strong> <a href='mailto:info@nourishnet.org' className='underline'>info@nourishnet.org</a></div>
		        <div><strong>Phone:</strong> +1 (555) 123-4567</div>
		      </div>
		    </div>
		    <div>
		      <h4 className='sr-only'>Contact form</h4>
		      <form onSubmit={(e)=>{e.preventDefault(); alert('Message sent (demo)'); e.target.reset() }} className='space-y-4'>
		        <div>
		          <label className='block text-sm text-gray-700 mb-1'>Name</label>
		          <input required className='w-full border px-3 py-2 rounded' name='name' />
		        </div>
		        <div>
		          <label className='block text-sm text-gray-700 mb-1'>Email</label>
		          <input required type='email' className='w-full border px-3 py-2 rounded' name='email' />
		        </div>
		        <div>
		          <label className='block text-sm text-gray-700 mb-1'>Message</label>
		          <textarea required className='w-full border px-3 py-2 rounded' name='message' rows={5}></textarea>
		        </div>
		        <div className='text-right'>
		          <button type='submit' className='px-6 py-2 rounded bg-[#66ada4] text-black font-semibold'>Send</button>
		        </div>
		      </form>
		    </div>
		  </div>
		</section>

		{/* Services section */}
		<section id='services' className='w-full bg-white min-h-screen flex items-center scroll-mt-20'>
		  <div className='max-w-6xl mx-auto px-6 py-12'>
		    <h3 className='text-2xl font-bold text-[#004b49] mb-6 text-center'>Our Services</h3>
		    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
		      {/* Card 1 */}
		      <div className='bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transform transition duration-200'>
		        <div className='w-12 h-12 rounded-md bg-[#66ada4] text-white flex items-center justify-center mb-4'>
		          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7v6a9 9 0 0018 0V7M5 7h14' /></svg>
		        </div>
		        <h4 className='font-semibold text-lg text-[#004b49] mb-2'>Food Donation Management</h4>
		        <p className='text-sm text-gray-700'>Streamline donor offers, scheduling and pickup coordination in one place.</p>
		      </div>

		      {/* Card 2 */}
		      <div className='bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transform transition duration-200'>
		        <div className='w-12 h-12 rounded-md bg-[#66ada4] text-white flex items-center justify-center mb-4'>
		          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3M16 7V3M4 11h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z' /></svg>
		        </div>
		        <h4 className='font-semibold text-lg text-[#004b49] mb-2'>NGO Coordination</h4>
		        <p className='text-sm text-gray-700'>Help NGOs manage requests, volunteers and distribution more effectively.</p>
		      </div>

		      {/* Card 3 */}
		      <div className='bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transform transition duration-200'>
		        <div className='w-12 h-12 rounded-md bg-[#66ada4] text-white flex items-center justify-center mb-4'>
		          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M16 3l4 4M8 3l-4 4' /></svg>
		        </div>
		        <h4 className='font-semibold text-lg text-[#004b49] mb-2'>Driver Pickup & Delivery</h4>
		        <p className='text-sm text-gray-700'>Real-time driver assignment and route coordination for quick deliveries.</p>
		      </div>

		      {/* Card 4 */}
		      <div className='bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg hover:scale-105 transform transition duration-200'>
		        <div className='w-12 h-12 rounded-md bg-[#66ada4] text-white flex items-center justify-center mb-4'>
		          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7h18M3 12h18M3 17h18' /></svg>
		        </div>
		        <h4 className='font-semibold text-lg text-[#004b49] mb-2'>Inventory Tracking</h4>
		        <p className='text-sm text-gray-700'>Keep track of donated items, quantities and expiry to optimize distribution.</p>
		      </div>
		    </div>
		  </div>
		</section>
	</>
	)
}

export default Header;
