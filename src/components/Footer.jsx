import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-linear-to-br from-[#002a29] via-[#004b49] to-[#11776f] text-white">
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-teal-200">N</span>
              </div>
              <h4 className="text-2xl font-bold tracking-wide">NourishNet</h4>
            </div>

            <p className="text-sm leading-6 text-white/80 max-w-sm">
              Connecting donors, NGOs, and drivers to reduce food waste and
              deliver hope to communities in need.
            </p>

            <div className="flex gap-3 mt-6">
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-teal-400/20 hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7.5c.013.18.013.36.013.54 0 5.5-4.19 11.84-11.84 11.84A11.78 11.78 0 0 1 2 18.5a8.42 8.42 0 0 0 .98.05 8.36 8.36 0 0 0 5.17-1.78 4.18 4.18 0 0 1-3.9-2.89 4.18 4.18 0 0 0 1.88-.07 4.18 4.18 0 0 1-3.35-4.1v-.05a4.26 4.26 0 0 0 1.9.52 4.17 4.17 0 0 1-1.29-5.57 11.84 11.84 0 0 0 8.59 4.36A4.71 4.71 0 0 1 20 5.6a8.4 8.4 0 0 0 2.1-.8 4.14 4.14 0 0 1-1.84 2.28z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-teal-400/20 hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.3 3h-1.9v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-teal-400/20 hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.1A3.9 3.9 0 1 0 15.9 12 3.9 3.9 0 0 0 12 8.1zm0 6.4A2.5 2.5 0 1 1 14.5 12 2.5 2.5 0 0 1 12 14.5zM18 6.7a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
            <h5 className="text-lg font-semibold mb-4 text-teal-200">
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                <Link to="/" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Join With Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
            <h5 className="text-lg font-semibold mb-4 text-teal-200">
              Resources
            </h5>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                <Link to="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
            <h5 className="text-lg font-semibold mb-4 text-teal-200">
              Stay Connected
            </h5>

            <p className="text-sm text-white/80 mb-3">
              Email us anytime:
            </p>
            <a
              href="mailto:nourishnet.system@gmail.com"
              className="text-sm text-white underline underline-offset-4 break-all"
            >
              nourishnet.system@gmail.com
            </a>

            <div className="mt-5">
              <p className="text-sm text-white/80 mb-3">
                Get updates from NourishNet
              </p>
              <div className="flex items-center bg-white/10 border border-white/10 rounded-xl overflow-hidden">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none"
                />
                <button className="px-4 py-3 bg-teal-300 text-[#002a29] font-semibold text-sm hover:bg-white transition">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="my-2 h-px bg-white/4"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <p>© {new Date().getFullYear()} NourishNet. All rights reserved.</p>
          <p className="text-center">
            Built with <span className="text-teal-200">♥</span> to fight food waste
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;