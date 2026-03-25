import React from 'react'

const Footer = () => {
  return (
    <footer className='bg-[#11776f] text-white'>
      <div className='max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8'>
        <div>
          <h4 className='text-lg font-semibold mb-2'>NourishNet</h4>
          <p className='text-sm opacity-90'>Connecting donors, NGOs and drivers to reduce food waste and feed communities.</p>
        </div>

        <div>
          <h5 className='font-semibold mb-2'>Quick Links</h5>
          <ul className='text-sm opacity-90 space-y-1'>
            <li><a href='/' className='hover:underline'>Home</a></li>
            <li><a href='/apply' className='hover:underline'>Join With Us</a></li>
            <li><a href='/login' className='hover:underline'>Sign In</a></li>
            <li><a href='/contact' className='hover:underline'>Contact</a></li>
          </ul>
        </div>

        <div>
          <h5 className='font-semibold mb-2'>Resources</h5>
          <ul className='text-sm opacity-90 space-y-1'>
            <li><a href='/about' className='hover:underline'>About</a></li>
            <li><a href='/privacy' className='hover:underline'>Privacy Policy</a></li>
            <li><a href='/terms' className='hover:underline'>Terms</a></li>
          </ul>
        </div>

        <div>
          <h5 className='font-semibold mb-2'>Contact</h5>
          <p className='text-sm opacity-90'>Email: <a href='mailto:info@nourishnet.org' className='underline'>info@nourishnet.org</a></p>
          <p className='text-sm opacity-90 mt-2'>Follow us</p>
          <div className='flex gap-3 mt-2'>
            <a aria-label='Twitter' className='w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-white/20'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M19 7.5c.013.18.013.36.013.54 0 5.5-4.19 11.84-11.84 11.84A11.78 11.78 0 0 1 2 18.5a8.42 8.42 0 0 0 .98.05 8.36 8.36 0 0 0 5.17-1.78 4.18 4.18 0 0 1-3.9-2.89 4.18 4.18 0 0 0 1.88-.07 4.18 4.18 0 0 1-3.35-4.1v-.05a4.26 4.26 0 0 0 1.9.52 4.17 4.17 0 0 1-1.29-5.57 11.84 11.84 0 0 0 8.59 4.36A4.71 4.71 0 0 1 20 5.6a8.4 8.4 0 0 0 2.1-.8 4.14 4.14 0 0 1-1.84 2.28z'/></svg>
            </a>
            <a aria-label='Facebook' className='w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-white/20'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.3 3h-1.9v7A10 10 0 0 0 22 12z' /></svg>
            </a>
            <a aria-label='Instagram' className='w-8 h-8 rounded bg-white/10 flex items-center justify-center hover:bg-white/20'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.1A3.9 3.9 0 1 0 15.9 12 3.9 3.9 0 0 0 12 8.1zm0 6.4A2.5 2.5 0 1 1 14.5 12 2.5 2.5 0 0 1 12 14.5zM18 6.7a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9z' /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className='border-t border-white/10'>
        <div className='w-full px-6 py-4 flex flex-col md:flex-row items-center justify-center text-sm opacity-90 gap-4'>
          <div>© {new Date().getFullYear()} NourishNet. All rights reserved.</div>
          <div>Built with ❤️ by the team</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
