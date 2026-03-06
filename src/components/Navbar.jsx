import React from 'react';
import { Logo } from '../assets/assets';

const Navbar = () => {
  return (
    <div className='absolute top-0 left-0 w-full z-10'>
        <div className='flex items-center justify-between px-6 md:px-16 lg:px-24 py-5'>
            {/* Logo + Brand Name - Left */}
            <div className='flex items-center gap-2'>
                <img src={Logo} alt="Logo" className='h-10 w-auto' />
                <h1 className='text-2xl font-bold text-white'>NourishNet</h1>
            </div>

            {/* Nav Links - Center */}
            <ul className='hidden md:flex items-center gap-2 text-white font-medium absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2'>
                <li><a href='#' className='cursor-pointer px-3 py-1 rounded-full hover:bg-white/20 hover:text-teal-300 transition-all'>Home</a></li>
                <li><a href='#' className='cursor-pointer px-3 py-1 rounded-full hover:bg-white/20 hover:text-teal-300 transition-all'>About</a></li>
                <li><a href='#' className='cursor-pointer px-3 py-1 rounded-full hover:bg-white/20 hover:text-teal-300 transition-all'>Services</a></li>
                <li><a href='#' className='cursor-pointer px-3 py-1 rounded-full hover:bg-white/20 hover:text-teal-300 transition-all'>Contact</a></li>
            </ul>

            {/* Sign In Button - Right */}
            <div>
                <button className='bg-teal-500 hover:bg-teal-600 text-black font-semibold px-5 py-2 rounded-full transition-colors'>
                    Sign In
                </button>
            </div>
        </div>
    </div>
  );
};

export default Navbar;
