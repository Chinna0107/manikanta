import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

function CountUp({ end, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(end);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const WHATSAPP_NUMBER = '919866048155';

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.subject.trim()) e.subject = true;
    if (!form.message.trim()) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const text = `*New Message from Manikanta Super Market Website*%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Email:* ${encodeURIComponent(form.email || 'Not provided')}%0A*Subject:* ${encodeURIComponent(form.subject)}%0A%0A*Message:*%0A${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setSent(true);
  };

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-xl border bg-brand-beige focus:outline-none focus:ring-2 transition-shadow text-gray-900 placeholder:text-gray-900/30 ${
      errors[key] ? 'border-red-400 focus:ring-red-300' : 'border-brand-red/10 focus:ring-brand-gold/40'
    }`;

  if (sent) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">WhatsApp Opened!</h3>
      <p className="text-gray-900/60 text-sm">Your message has been pre-filled in WhatsApp. Just hit send!</p>
      <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
        className="text-sm font-bold text-brand-red underline mt-2">Send another message</button>
    </div>
  );

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name *</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputClass('name')} placeholder="Your Name" />
        {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address <span className="text-gray-900/40 font-normal">(optional)</span></label>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className={inputClass('email')} placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Subject *</label>
        <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          className={inputClass('subject')} placeholder="How can we help?" />
        {errors.subject && <p className="text-xs text-red-500 mt-1">Subject is required</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Message *</label>
        <textarea rows="4" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className={inputClass('message') + ' resize-none'} placeholder="Write your message here..." />
        {errors.message && <p className="text-xs text-red-500 mt-1">Message is required</p>}
      </div>
      <motion.button type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white text-brand-red font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all mt-2"
      >
        Send via WhatsApp
        <Send className="w-5 h-5" />
      </motion.button>
    </form>
  );
}

export function ContactPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#faq-section') {
      // Delay to ensure the DOM is fully rendered before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById('faq-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  return (
    <div className="bg-brand-beige min-h-screen pb-20 md:pb-12 font-sans">
      <Header title="Contact Us" />

      {/* Hero Banner */}
      <div className="px-4 md:px-24 pt-12 md:pt-16 pb-10 md:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h4 className="text-brand-red font-bold tracking-widest uppercase text-xs md:text-sm mb-3">Customer Support</h4>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
            We’re here for your daily essentials
          </h1>
          <div className="w-20 h-1.5 bg-brand-red text-white rounded-full mb-6"></div>
          <p className="text-gray-900/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Need help with grocery delivery, fresh produce, household items, or your recent order? Our team is ready to help you shop smarter and faster.
          </p>
        </motion.div>
      </div>

      {/* Contact Cards + Form */}
      <div className="px-4 md:px-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6 h-full"
          >
            {/* Location */}
            <div className="bg-white border border-brand-red/10 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Store Location</h3>
                <p className="text-gray-900/70 text-sm leading-relaxed">Aspari main road opposite APGB Bank, 518347</p>
                <p className="text-gray-900/40 text-xs mt-1">Open for quick pickup & in-store shopping</p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white border border-brand-red/10 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Call & WhatsApp</h3>
                <p className="text-gray-900/70 text-sm">+91 98660 48155</p>
                <p className="text-gray-900/40 text-xs mt-1">Mon–Sun, 9:00 AM – 9:00 PM</p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white border border-brand-red/10 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Email Support</h3>
                <p className="text-gray-900/70 text-sm">mani.worriers@gmail.com</p>
                <p className="text-gray-900/40 text-xs mt-1">We usually reply within 24 hours</p>
              </div>
            </div>

            {/* Social Links - flex-grow so it fills remaining height */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-brand-red text-lg mb-4">Follow Our Store</h3>
                <div className="flex items-center gap-4">
                  <a href="https://www.instagram.com/manikantasupermarket?igsh=c2llNGRzM2RpbHZ3&utm_source=qr" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm hover:scale-105 hover:shadow-md transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://youtube.com/@manikanta7471?si=3sOLJa_Rvzxhgx7V" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm hover:scale-105 hover:shadow-md transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/share/17AsQdiXcc/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm hover:scale-105 hover:shadow-md transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                  </a>
                </div>
              </div>
              <p className="text-gray-700 text-xs mt-6">Connect with us for fresh deals and store updates 🌿</p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-brand-red/10 rounded-[24px] shadow-lg p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-gold to-brand-dark-blue rounded-t-[24px]"></div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-900/60 text-sm mb-8">Fill in the form and we'll get back to you shortly.</p>

<ContactForm />
          </motion.div>

        </div>
      </div>

      {/* WhatsApp Quick Contact Banner */}
      <div className="px-4 md:px-24 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-red rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-1">Need help fast? Chat with us</h3>
              <p className="text-white/80 text-sm">Ask about fresh groceries, delivery, pickup, bulk orders, and everyday essentials.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919866048155"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white text-brand-red font-bold py-4 px-8 rounded-xl hover:scale-105 hover:shadow-2xl transition-all text-sm md:text-base"
          >
            Message on WhatsApp →
          </a>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div id="faq-section" className="bg-white py-16">
        <div className="px-4 md:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-brand-red text-white mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { q: 'Do you offer home delivery in my area?', a: 'Yes. We provide local delivery for eligible locations. Contact us with your address and order details to check availability and estimated delivery time.' },
              { q: 'Can I order groceries for same-day pickup?', a: 'Absolutely. You can place an order online and choose pickup at our store for faster collection on selected items and time slots.' },
              { q: 'Are your fruits and vegetables fresh?', a: 'We focus on fresh, quality-checked produce and daily essentials sourced for reliable freshness and value for your household needs.' },
              { q: 'Do you support bulk orders for events or families?', a: 'Yes. We offer bulk purchase support for family events, parties, gatherings, and regular household restocking. Send your list and quantity requirements via WhatsApp or email.' },
              { q: 'What payment methods do you accept?', a: 'We accept cash, card payments, digital wallets, and secure online payment options depending on the order type and checkout method.' },
              { q: 'What if my delivery is missing or damaged?', a: 'Please contact us immediately with your order number and clear photos. We will help resolve the issue quickly and arrange a replacement or refund when applicable.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-brand-beige border border-brand-red/10 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-brand-red text-xs font-bold">Q</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-900/70 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-4 md:px-24 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { end: 500, suffix: '+', label: 'Happy Customers' },
            { end: 24, suffix: 'hr', label: 'Response Time' },
            { end: 100, suffix: '%', label: 'Tarnish Free' },
            { end: 7, suffix: ' Days', label: 'Easy Returns' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-brand-red/10 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow"
            >
              <p className="text-3xl md:text-4xl font-serif font-bold text-brand-red mb-2">
                <CountUp end={stat.end} suffix={stat.suffix} duration={1600 + i * 200} />
              </p>
              <p className="text-gray-900/70 text-sm font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
