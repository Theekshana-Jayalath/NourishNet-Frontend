import React from 'react'

const sections = [
  {
    title: 'Information We Collect',
    text: 'We may collect personal details such as your name, email, phone number, organization details, and activity on the platform to provide and improve our services.'
  },
  {
    title: 'How We Use Your Information',
    text: 'Your information is used to manage accounts, process requests and donations, improve platform features, communicate updates, and ensure platform security.'
  },
  {
    title: 'Data Protection',
    text: 'We apply appropriate security measures to protect user information from unauthorized access, disclosure, or misuse.'
  },
  {
    title: 'Sharing of Information',
    text: 'We do not sell personal information. Data may only be shared when necessary for operational purposes, legal compliance, or platform functionality.'
  },
  {
    title: 'Cookies and Tracking',
    text: 'We may use cookies or similar technologies to improve user experience, remember preferences, and analyze platform performance.'
  },
  {
    title: 'Your Rights',
    text: 'Users may request access, correction, or deletion of their personal information, subject to applicable policies and legal obligations.'
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#002a29]">
      <section className="bg-gradient-to-r from-[#002a29] to-[#004b49] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#96ded1]">
            Legal
          </p>
          <h1 className="text-4xl font-black md:text-5xl">Privacy Policy</h1>
          <p className="mt-5 max-w-3xl text-base text-white/85 md:text-lg">
            This Privacy Policy explains how NourishNet collects, uses, stores,
            and protects your information while using our platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-[#96ded1]/40 md:p-10">
          <p className="mb-8 text-sm text-[#317873]">
            Last updated: April 2026
          </p>

          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[24px] bg-[#96ded1]/15 p-6 ring-1 ring-[#66ada4]/20"
              >
                <h2 className="text-xl font-bold text-[#004b49]">{section.title}</h2>
                <p className="mt-3 leading-8 text-[#317873]">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}