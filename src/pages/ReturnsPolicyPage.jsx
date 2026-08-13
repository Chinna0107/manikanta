import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { XCircle, Package, AlertTriangle, Video, Clock, ChevronDown, ShieldCheck } from 'lucide-react';

const claimSteps = [
  {
    num: '01',
    title: 'Record an Unboxing Video',
    desc: 'Before opening your package, start recording a clear, uninterrupted video. The video must show the sealed package, the unboxing process, and the condition of the item(s) inside.',
  },
  {
    num: '02',
    title: 'Report Within 7 Days',
    desc: 'Contact us within 7 days of delivery via WhatsApp (+91 98660 48155) or email (mani.worriers@gmail.com). Include your order number, a description of the issue, and attach the unboxing video as proof.',
  },
  {
    num: '03',
    title: 'We Review Your Claim',
    desc: 'Our team will review the submitted proof within 24–48 hours and confirm whether your claim is approved. Claims without a valid unboxing video cannot be processed.',
  },
  {
    num: '04',
    title: 'Resolution',
    desc: 'For shipping damage: the replacement item will be sent in the next shipment at no extra cost. For missing items: we will refund the item amount, issue a store coupon, or ship the missing item in the next shipment — whichever you prefer.',
  },
];

const faqs = [
  {
    q: 'Do you accept returns or exchanges?',
    a: 'No. All sales are final. We do not accept returns or exchanges for any reason, including change of mind, sizing, or preference. Please review your order carefully before placing it.',
  },
  {
    q: 'What if my item arrived damaged?',
    a: 'If your item was damaged during shipping, we will replace it in the next shipment at no cost to you. You must provide an unboxing video as proof and report the issue within 7 days of delivery.',
  },
  {
    q: 'What if an item is missing from my order?',
    a: 'If an item is missing, we will either refund the amount for that item, issue a store coupon of equivalent value, or ship the missing item in the next shipment. You must provide an unboxing video showing the incomplete order and report within 7 days.',
  },
  {
    q: 'Why is an unboxing video required?',
    a: 'An unboxing video is the only way to verify the condition of the package at the time of delivery and confirm that items were missing or damaged. Without this proof, we are unable to process any claims.',
  },
  {
    q: 'What if I did not record an unboxing video?',
    a: 'Unfortunately, without an unboxing video we cannot process damage or missing item claims. We strongly recommend recording a video every time you receive a package from us.',
  },
  {
    q: 'How long do I have to report an issue?',
    a: 'All issues — shipping damage or missing items — must be reported within 7 days of the delivery date. Claims submitted after this window cannot be accepted.',
  },
];

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-brand-red/10' : 'border-brand-red/10'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 bg-white text-left">
        <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-900/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden bg-brand-beige"
      >
        <p className="px-5 py-4 text-sm text-gray-900/70 leading-relaxed border-t border-brand-red/10">{faq.a}</p>
      </motion.div>
    </div>
  );
}

export function ReturnsPolicyPage() {
  return (
    <div className="bg-brand-beige min-h-screen pb-20 md:pb-12 font-sans">
      <Header title="Returns & Exchanges" />

      {/* Hero */}
      <div className="bg-white">
        <div className="px-4 md:px-24 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="font-bold tracking-widest uppercase text-xs mb-4" style={{ color: '#C6A184' }}>Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">
              Returns &<br className="hidden md:block" /> Exchanges
            </h1>
            <div className="w-20 h-1.5 rounded-full mb-6" style={{ background: '#C6A184' }}></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              All sales are final. However, we take full responsibility for shipping damage and missing items — with proper proof, we'll make it right.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: July 2025</p>
          </motion.div>
        </div>
      </div>

      {/* Key Terms Strip */}
      <div className="px-4 md:px-24 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { label: 'Returns', value: 'Not Accepted' },
            { label: 'Exchanges', value: 'Not Accepted' },
            { label: 'Report Window', value: '7 Days' },
            { label: 'Proof Required', value: 'Unboxing Video' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-brand-red/10 rounded-2xl p-4 md:p-5 text-center shadow-sm"
            >
              <p className={`text-lg md:text-xl font-serif font-bold ${i < 2 ? 'text-red-500' : 'text-brand-red'}`}>{s.value}</p>
              <p className="text-gray-900/60 text-xs md:text-sm font-semibold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          <div className="lg:col-span-2 space-y-10">

            {/* No Returns Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4"
            >
              <XCircle className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 text-lg mb-2">No Returns or Exchanges</h3>
                <p className="text-red-600 text-sm leading-relaxed">
                  All sales at Manikanta Super Market are <strong>final</strong>. We do not accept returns or exchanges for any reason, including change of mind, sizing issues, or personal preference. Please review your order carefully before completing your purchase.
                </p>
              </div>
            </motion.div>

            {/* What We Do Cover */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">What We Do Cover</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-brand-red/10 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Shipping Damage</h3>
                  </div>
                  <p className="text-gray-900/65 text-sm leading-relaxed mb-3">
                    If your item arrives physically damaged due to shipping, we will send a <strong className="text-gray-900">replacement in the next shipment</strong> at no cost to you.
                  </p>
                  <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                    ⚠️ Unboxing video proof required
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-brand-red/10 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Missing Items</h3>
                  </div>
                  <p className="text-gray-900/65 text-sm leading-relaxed mb-3">
                    If an item is missing from your order, we will — at your choice — <strong className="text-gray-900">refund the amount</strong>, issue a <strong className="text-gray-900">store coupon</strong>, or ship the missing item in the <strong className="text-gray-900">next shipment</strong>.
                  </p>
                  <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium">
                    ⚠️ Unboxing video proof required
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Proof Requirement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-brand-red text-white/20 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-brand-red" />
                </div>
                <h3 className="font-bold text-white text-xl">Unboxing Video — Mandatory Proof</h3>
              </div>
              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>To file a claim for shipping damage or a missing item, you <strong className="text-white">must provide an unboxing video</strong>. This is the only accepted form of proof.</p>
                <p>The video must:</p>
                <ul className="space-y-2 pl-2">
                  {[
                    'Show the sealed, unopened package before unboxing begins',
                    'Be a single, uninterrupted recording — no cuts or edits',
                    'Clearly show the condition of all items inside the package',
                    'Be recorded at the time of delivery, not after',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red text-white shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-white/50 text-xs pt-2">Claims submitted without a valid unboxing video will not be processed under any circumstances.</p>
              </div>
            </motion.div>

            {/* Reporting Window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-brand-red/10 rounded-2xl p-6 md:p-8 shadow-sm flex gap-5"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-brand-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">7-Day Reporting Window</h3>
                <p className="text-gray-900/65 text-sm leading-relaxed">
                  All claims for shipping damage or missing items must be reported within <strong className="text-gray-900">7 days of the delivery date</strong>. After this window, we are unable to process any claims regardless of the circumstances.
                </p>
              </div>
            </motion.div>

            {/* How to Claim Steps */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">How to File a Claim</h2>
              <div className="space-y-4">
                {claimSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white border border-brand-red/10 rounded-2xl p-5 md:p-6 flex gap-5 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                      <span className="text-brand-red font-bold text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">{step.title}</h4>
                      <p className="text-gray-900/65 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <FaqItem faq={faq} />
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand-red text-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">File a Claim</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">Have a shipping damage or missing item issue? Contact us with your unboxing video.</p>
              <a href="https://wa.me/19404656563" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-brand-red text-white text-gray-900 font-bold py-3 rounded-xl text-sm hover:bg-brand-red text-white/80 transition-all">
                Chat on WhatsApp
              </a>
              <a href="mailto:mani.worriers@gmail.com"
                className="block w-full mt-3 border border-white/20 text-white/70 font-semibold py-3 rounded-xl text-sm hover:bg-white/10 transition-all">
                Email Us
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-brand-red/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-bold text-gray-900 text-base">Contact Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-900/40 font-semibold uppercase tracking-widest">Email</p>
                  <p className="text-gray-900/80 text-sm mt-0.5">mani.worriers@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900/40 font-semibold uppercase tracking-widest">WhatsApp</p>
                  <p className="text-gray-900/80 text-sm mt-0.5">+91 98660 48155</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900/40 font-semibold uppercase tracking-widest">Hours</p>
                  <p className="text-gray-900/80 text-sm mt-0.5">Mon–Sat, 9AM – 6PM CST</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-brand-beige border border-brand-red/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-brand-red" />
                <h3 className="font-bold text-gray-900 text-base">Quick Summary</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-900/70">
                <li className="flex items-start gap-2"><span className="text-red-400 font-bold mt-0.5">✕</span> No returns accepted</li>
                <li className="flex items-start gap-2"><span className="text-red-400 font-bold mt-0.5">✕</span> No exchanges accepted</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Shipping damage → replacement</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Missing item → refund / coupon / resend</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">!</span> Unboxing video required</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">!</span> Report within 7 days of delivery</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-beige border border-brand-red/10 rounded-2xl p-6"
            >
              <h3 className="font-bold text-gray-900 text-base mb-4">Related Policies</h3>
              <a href="/shipping-policy" className="flex items-center justify-between py-3 border-b border-brand-red/10 text-sm text-gray-900/70 hover:text-brand-red transition-colors">
                Shipping Policy <span>→</span>
              </a>
              <a href="/contact#faq-section" className="flex items-center justify-between pt-3 text-sm text-gray-900/70 hover:text-brand-red transition-colors">
                All FAQs <span>→</span>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
