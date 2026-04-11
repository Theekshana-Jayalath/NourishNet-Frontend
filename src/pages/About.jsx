import React from 'react'

export default function About() {
  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#002a29]">
      <section className="bg-gradient-to-r from-[#004b49] to-[#317873] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#96ded1]">
            NourishNet
          </p>
          <h1 className="text-4xl font-black md:text-5xl">About Us</h1>
          <p className="mt-5 max-w-2xl text-base text-white/85 md:text-lg">
            NourishNet connects donors, NGOs, and communities to reduce food waste
            and improve food accessibility through a transparent and efficient platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-[#96ded1]/40">
            <h2 className="text-2xl font-bold text-[#004b49]">Who We Are</h2>
            <p className="mt-4 leading-8 text-[#317873]">
              NourishNet is a food redistribution platform designed to connect
              surplus food sources with NGOs and communities in need. Our mission
              is to create a sustainable ecosystem where food reaches the right
              hands instead of going to waste.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-[#96ded1]/40">
            <h2 className="text-2xl font-bold text-[#004b49]">Our Mission</h2>
            <p className="mt-4 leading-8 text-[#317873]">
              We aim to minimize food waste, empower nonprofit organizations,
              and support vulnerable communities by building a trusted and easy-to-use
              digital solution for food donation and request management.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#96ded1]/25 p-8 ring-1 ring-[#66ada4]/30">
            <h2 className="text-2xl font-bold text-[#004b49]">What We Offer</h2>
            <ul className="mt-4 space-y-3 text-[#002a29]">
              <li>• Food donation coordination</li>
              <li>• NGO request handling</li>
              <li>• Transparent logistics workflows</li>
              <li>• Better communication between stakeholders</li>
            </ul>
          </div>

          <div className="rounded-[28px] bg-[#004b49] p-8 text-white">
            <h2 className="text-2xl font-bold">Why It Matters</h2>
            <p className="mt-4 leading-8 text-[#96ded1]">
              Every meal saved can make a difference. By improving coordination
              and visibility, NourishNet helps ensure that food reaches people
              who need it most while encouraging responsible consumption.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}