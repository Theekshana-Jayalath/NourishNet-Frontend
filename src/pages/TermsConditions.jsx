import React from 'react'

const terms = [
  {
    title: 'Acceptance of Terms',
    text: 'By accessing or using NourishNet, you agree to comply with these Terms and Conditions and all applicable laws and regulations.'
  },
  {
    title: 'Use of the Platform',
    text: 'Users must use the platform responsibly and only for lawful purposes related to food donation, request management, and associated activities.'
  },
  {
    title: 'User Accounts',
    text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity carried out under your account.'
  },
  {
    title: 'Accuracy of Information',
    text: 'Users must provide accurate and up-to-date information when submitting applications, requests, or profile details.'
  },
  {
    title: 'Prohibited Activities',
    text: 'Users must not misuse the platform, attempt unauthorized access, submit false data, or disrupt system functionality.'
  },
  {
    title: 'Limitation of Liability',
    text: 'NourishNet is provided as a coordination platform. We are not liable for losses arising from delays, incomplete data, or third-party actions beyond our reasonable control.'
  },
  {
    title: 'Changes to Terms',
    text: 'We may update these Terms and Conditions from time to time. Continued use of the platform after changes means you accept the revised terms.'
  },
]

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#002a29]">
      <section className="bg-gradient-to-r from-[#004b49] to-[#66ada4] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#96ded1]">
            Legal
          </p>
          <h1 className="text-4xl font-black md:text-5xl">Terms & Conditions</h1>
          <p className="mt-5 max-w-3xl text-base text-white/90 md:text-lg">
            These Terms & Conditions govern your use of the NourishNet platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-[#96ded1]/40 md:p-10">
          <p className="mb-8 text-sm text-[#317873]">
            Last updated: April 2026
          </p>

          <div className="space-y-6">
            {terms.map((item, index) => (
              <div key={item.title} className="border-b border-[#96ded1]/40 pb-6 last:border-b-0">
                <h2 className="text-xl font-bold text-[#004b49]">
                  {index + 1}. {item.title}
                </h2>
                <p className="mt-3 leading-8 text-[#317873]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}