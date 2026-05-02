import React from 'react'
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom'
import { about } from '../assets/assets'

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

		{/* About section - Modern Redesign */}
<section id='about' className='bg-white w-full min-h-screen flex items-center scroll-mt-20'>
  <div className='max-w-6xl mx-auto px-6 py-16'>
    <div className='text-center mb-12'>
      <div className='inline-block px-3 py-1 rounded-full bg-[#96ded1]/30 text-[#004b49] text-xs font-semibold mb-3 tracking-wide'>
        Who We Are
      </div>
      <h3 className='text-3xl md:text-4xl font-bold text-[#004b49] mb-3'>
        About <span className='text-[#317873]'>NourishNet</span>
      </h3>
      <p className='text-[#317873] max-w-2xl mx-auto'>
        Connecting donors, NGOs, and drivers to fight food insecurity together
      </p>
    </div>

    <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
      {/* Left side - Image */}
      <div className='relative group'>
        <div className='absolute -inset-1 bg-gradient-to-r from-[#004b49] to-[#96ded1] rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300'></div>
        <div className='relative overflow-hidden rounded-2xl shadow-xl'>
          <img 
            src={about} 
            alt='Food donation' 
            className='w-full rounded-2xl transition-transform duration-500 group-hover:scale-105'
          />
        </div>
        {/* Floating badge on image */}
        <div className='absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg'>
          <span className='text-sm font-bold text-[#004b49]'>❤️ 10K+ Meals Saved</span>
        </div>
      </div>

      {/* Right side - Content */}
      <div className='space-y-6'>
        <p className='text-[#002a29] leading-relaxed text-lg'>
          NourishNet connects <span className='font-bold text-[#004b49]'>donors, NGOs, and drivers</span> in real-time to redistribute surplus food to communities in need.
        </p>
        
        <p className='text-[#317873] leading-relaxed'>
          Our platform makes it simple for organizations and individuals to donate, coordinate, and track deliveries to ensure food reaches people quickly and safely.
        </p>

        {/* Feature list with icons */}
        <div className='space-y-3 pt-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#004b49] text-white text-sm font-bold'>1</div>
            <div>
              <span className='font-semibold text-[#004b49]'>Reduce Food Waste</span>
              <p className='text-sm text-[#317873]'>Save surplus food from going to landfills</p>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#004b49] text-white text-sm font-bold'>2</div>
            <div>
              <span className='font-semibold text-[#004b49]'>Support Communities</span>
              <p className='text-sm text-[#317873]'>Help feed families in need across the country</p>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#004b49] text-white text-sm font-bold'>3</div>
            <div>
              <span className='font-semibold text-[#004b49]'>Real-time Coordination</span>
              <p className='text-sm text-[#317873]'>Track donations and deliveries instantly</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className='flex gap-6 pt-6 border-t border-[#96ded1]/30'>
          <div>
            <div className='text-2xl font-bold text-[#004b49]'>50+</div>
            <div className='text-xs text-[#317873]'>NGO Partners</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-[#004b49]'>100+</div>
            <div className='text-xs text-[#317873]'>Active Donors</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-[#004b49]'>24/7</div>
            <div className='text-xs text-[#317873]'>Support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

		{/* Contact section - Modern */}
<section id='contact' className='bg-[#f4fbfa] w-full min-h-screen flex items-center scroll-mt-20'>
  <div className='max-w-6xl mx-auto px-6 py-12'>
    <div className='text-center mb-10'>
      <div className='inline-block px-3 py-1 rounded-full bg-[#96ded1]/30 text-[#004b49] text-xs font-semibold mb-3 tracking-wide'>
        Get In Touch
      </div>
      <h3 className='text-3xl md:text-4xl font-bold text-[#004b49] mb-3'>Contact <span className='text-[#317873]'>Us</span></h3>
      <p className='text-[#317873] max-w-md mx-auto'>Reach out for partnerships, donations or general inquiries.</p>
    </div>
    
    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
      {/* Contact Info */}
      <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
        <div className='space-y-6'>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#004b49] text-white text-lg'>📍</div>
            <div>
              <div className='font-bold text-[#004b49]'>Address</div>
              <div className='text-sm text-[#317873]'>123 Community Lane, City, Country</div>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#004b49] text-white text-lg'>📧</div>
            <div>
              <div className='font-bold text-[#004b49]'>Email</div>
              <a href='mailto:info@nourishnet.org' className='text-sm text-[#317873] underline hover:text-[#004b49] transition-colors'>info@nourishnet.org</a>
            </div>
          </div>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#004b49] text-white text-lg'>📞</div>
            <div>
              <div className='font-bold text-[#004b49]'>Phone</div>
              <div className='text-sm text-[#317873]'>+1 (555) 123-4567</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow'>
        <form onSubmit={(e)=>{e.preventDefault(); alert('Message sent (demo)'); e.target.reset() }} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-[#004b49] mb-2'>Full Name</label>
            <input required className='w-full border border-[#96ded1]/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004b49] focus:border-transparent transition-all' name='name' placeholder='Enter your name' />
          </div>
          <div>
            <label className='block text-sm font-medium text-[#004b49] mb-2'>Email Address</label>
            <input required type='email' className='w-full border border-[#96ded1]/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004b49] focus:border-transparent transition-all' name='email' placeholder='your@email.com' />
          </div>
          <div>
            <label className='block text-sm font-medium text-[#004b49] mb-2'>Your Message</label>
            <textarea required className='w-full border border-[#96ded1]/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004b49] focus:border-transparent transition-all' name='message' rows={4} placeholder='How can we help you?'></textarea>
          </div>
          <button type='submit' className='w-full rounded-xl bg-gradient-to-r from-[#004b49] to-[#317873] px-6 py-3 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300'>
            Send Message →
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

{/* Services section - Modern */}
<section id='services' className='bg-white w-full min-h-screen flex items-center scroll-mt-20'>
  <div className='max-w-6xl mx-auto px-6 py-12'>
    <div className='text-center mb-12'>
      <div className='inline-block px-3 py-1 rounded-full bg-[#96ded1]/30 text-[#004b49] text-xs font-semibold mb-3 tracking-wide'>
        What We Provide
      </div>
      <h3 className='text-3xl md:text-4xl font-bold text-[#004b49] mb-3'>Our <span className='text-[#317873]'>Services</span></h3>
      <p className='text-[#317873] max-w-lg mx-auto'>Comprehensive solutions for food donation and distribution</p>
    </div>
    
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {/* Card 1 */}
      <div className='group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#96ded1]/30'>
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-[#004b49] to-[#317873] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform'>
          <span className='text-2xl'>🍽️</span>
        </div>
        <h4 className='font-bold text-lg text-[#004b49] mb-2'>Food Donation Management</h4>
        <p className='text-sm text-[#317873] leading-relaxed'>Streamline donor offers, scheduling and pickup coordination in one place.</p>
      </div>

      {/* Card 2 */}
      <div className='group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#96ded1]/30'>
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-[#004b49] to-[#317873] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform'>
          <span className='text-2xl'>🏢</span>
        </div>
        <h4 className='font-bold text-lg text-[#004b49] mb-2'>NGO Coordination</h4>
        <p className='text-sm text-[#317873] leading-relaxed'>Help NGOs manage requests, volunteers and distribution more effectively.</p>
      </div>

      {/* Card 3 */}
      <div className='group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#96ded1]/30'>
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-[#004b49] to-[#317873] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform'>
          <span className='text-2xl'>🚚</span>
        </div>
        <h4 className='font-bold text-lg text-[#004b49] mb-2'>Driver Pickup & Delivery</h4>
        <p className='text-sm text-[#317873] leading-relaxed'>Real-time driver assignment and route coordination for quick deliveries.</p>
      </div>

      {/* Card 4 */}
      <div className='group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#96ded1]/30'>
        <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-[#004b49] to-[#317873] text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform'>
          <span className='text-2xl'>📦</span>
        </div>
        <h4 className='font-bold text-lg text-[#004b49] mb-2'>Inventory Tracking</h4>
        <p className='text-sm text-[#317873] leading-relaxed'>Keep track of donated items, quantities and expiry to optimize distribution.</p>
      </div>
    </div>
  </div>
</section>
	</>
	)
}

export default Header;