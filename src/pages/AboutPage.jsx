import React, { useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  HeartHandshake,
  MapPin,
  ShoppingCart,
} from 'lucide-react';
import { Header } from '../components/Header';
import logo from '../assets/logo.png';

const HERO_IMAGE =
  'https://images.pexels.com/photos/18764913/pexels-photo-18764913.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80';

const ABOUT_STEPS = [
  {
    id: 'source',
    label: '01 / THE START',
    title: 'Sourced with care',
    description:
      'We choose trusted suppliers and everyday staples with your kitchen in mind.',
  },
  {
    id: 'stock',
    label: '02 / THE RHYTHM',
    title: 'Stocked fresh daily',
    description:
      'Our team keeps produce, dairy, bakery, and pantry shelves ready for the day ahead.',
  },
  {
    id: 'handoff',
    label: '03 / THE HANDOFF',
    title: 'Packed for your plans',
    description:
      'Walk in, order ahead, or choose pickup — we make the handoff easy.',
  },
];

const ABOUT_AISLES = [
  {
    id: 'produce',
    title: 'Fresh produce',
    subtitle: 'Picked for color and crunch.',
    description: 'Crisp greens, seasonal fruits, and colorful vegetables.',
  },
  {
    id: 'dairy-bakery',
    title: 'Dairy & bakery',
    subtitle: 'The small comforts of breakfast.',
    description:
      'Milk, eggs, breads, and the small comforts that make breakfast better.',
  },
  {
    id: 'pantry',
    title: 'Pantry essentials',
    subtitle: 'A steady base for the week.',
    description:
      'Rice, lentils, spices, snacks, and household basics for the week.',
  },
];

function StepList({ steps }) {
  return (
    <div className="relative mt-8">
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-[11px] top-3 w-px bg-brand-gold/65"
      />
      <div className="space-y-7">
        {steps.map((step) => (
          <article key={step.id} className="relative pl-10">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-4 border-brand-cream bg-brand-red shadow-sm"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
              {step.label}
            </p>
            <h3 className="mt-1 font-serif text-[22px] font-bold text-brand-dark-blue">
              {step.title}
            </h3>
            <p className="mt-1.5 max-w-xl text-[13px] leading-[1.65] text-brand-maroon/75">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function AisleAccordion({ items, defaultOpenId }) {
  const [openIds, setOpenIds] = useState(() => new Set([defaultOpenId]));

  const toggleAisle = (id) => {
    setOpenIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  };

  return (
    <div className="mt-7 border-y border-brand-gold/35 bg-white/45">
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const triggerId = `aisle-trigger-${item.id}`;
        const panelId = `aisle-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`border-brand-gold/25 px-5 py-4 ${index < items.length - 1 ? 'border-b' : ''}`}
          >
            <button
              id={triggerId}
              type="button"
              aria-controls={panelId}
              aria-expanded={isOpen}
              onClick={() => toggleAisle(item.id)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl text-left outline-hidden transition-colors duration-200 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream motion-reduce:transition-none"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  index === 0
                    ? 'bg-brand-red text-white'
                    : 'bg-brand-dark-blue text-brand-gold'
                }`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[15px] font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                    isOpen ? 'text-brand-red' : 'text-brand-dark-blue'
                  }`}
                >
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-brand-maroon/55">
                  {item.subtitle}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-[18px] w-[18px] shrink-0 text-brand-gold transition-transform duration-200 motion-reduce:transition-none ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="ml-11 mt-3 border-l-2 border-brand-gold/45 pl-3 text-[13px] leading-[1.6] text-brand-maroon/75">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AboutPage() {
  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden bg-brand-cream pb-[calc(10rem+env(safe-area-inset-bottom))] text-brand-dark-blue antialiased"
    >
      <Header title="Our Story" />

      <main className="mx-auto w-full max-w-[1080px]">
        <section aria-labelledby="about-heading" className="relative overflow-hidden">
          <div className="relative h-[440px] overflow-hidden rounded-b-[36px] md:mx-6 md:rounded-[36px] lg:mx-10">
            <img
              src={HERO_IMAGE}
              alt="Warm, inviting grocery aisle with wooden shelves — Orhan Pergel on Pexels"
              className="h-full w-full object-cover object-center"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/35 via-transparent to-brand-cream"
            />

            <div className="absolute left-1/2 top-7 -translate-x-1/2 text-center">
              <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-white/70 bg-white/90 p-2 shadow-lg backdrop-blur-xs">
                <img
                  src={logo}
                  alt="Manikanta Super Market logo"
                  className="h-full w-full object-contain"
                  decoding="async"
                  loading="eager"
                />
              </div>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white drop-shadow-sm">
                Manikanta Super Market
              </p>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-[26px] bg-brand-cream/95 px-4 pb-5 pt-4 shadow-sm backdrop-blur-xs md:inset-x-6 md:px-6 md:pb-6 md:pt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">
                OUR STORY
              </p>
              <h1
                id="about-heading"
                className="max-w-[660px] font-serif text-[35px] font-bold leading-[1.04] tracking-[-0.03em] text-brand-dark-blue md:text-5xl lg:text-6xl"
              >
                A familiar market, made for your everyday.
              </h1>
              <p className="mt-3 max-w-[690px] text-[13px] leading-[1.65] text-brand-maroon/80 md:text-base">
                Manikanta Super Market is here for the moments between the big plans: a quick top-up, a fresh dinner, and the ingredients that make home feel like home.
              </p>
              <a
                href="#aisles"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-dark-blue px-4 py-2.5 text-[12px] font-semibold text-brand-cream shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream active:scale-[0.98] motion-reduce:transition-none"
              >
                Explore the aisles
                <ArrowUpRight aria-hidden="true" className="h-[15px] w-[15px]" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="journey"
          aria-labelledby="journey-heading"
          className="px-5 pb-10 pt-12 md:mx-auto md:max-w-3xl md:px-8 md:pt-16"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-red">
                HOW WE WORK
              </p>
              <h2
                id="journey-heading"
                className="font-serif text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-brand-dark-blue md:text-4xl"
              >
                From shelf to home
              </h2>
            </div>
            <span className="mb-1 shrink-0 rounded-full bg-brand-dark-blue px-2.5 py-1 text-[10px] font-semibold text-brand-gold">
              03 steps
            </span>
          </div>
          <p className="mt-3 max-w-[520px] text-[13px] leading-[1.65] text-brand-maroon/70 md:text-sm">
            The everyday details are where our promise lives.
          </p>
          <StepList steps={ABOUT_STEPS} />
        </section>

        <section
          id="aisles"
          aria-labelledby="aisles-heading"
          className="border-t border-brand-gold/25 pb-8 pt-10"
        >
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-red">
              WHAT WE KEEP READY
            </p>
            <h2
              id="aisles-heading"
              className="font-serif text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-brand-dark-blue md:text-4xl"
            >
              Our everyday aisles
            </h2>
            <p className="mt-3 text-[13px] leading-[1.65] text-brand-maroon/70 md:text-sm">
              Tap an aisle to see what makes it part of your weekly rhythm.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <AisleAccordion items={ABOUT_AISLES} defaultOpenId="produce" />
          </div>
        </section>

        <section aria-label="Closing note" className="px-5 pb-4 pt-3 md:mx-auto md:max-w-3xl md:px-8">
          <div className="rounded-[26px] bg-brand-dark-blue px-5 py-5 text-brand-cream shadow-sm md:px-7 md:py-7">
            <div className="flex items-start gap-3">
              <HeartHandshake
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold"
              />
              <div>
                <p className="font-serif text-xl font-bold leading-tight md:text-2xl">
                  Good food starts close to home.
                </p>
                <p className="mt-2 text-[12px] leading-[1.6] text-brand-cream/70 md:text-sm">
                  Thank you for letting us be part of your everyday.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav
        aria-label="Shopping actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-gold/35 bg-brand-cream/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xs"
      >
        <div className="mx-auto flex max-w-[520px] gap-2">
          <a
            href="#journey"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-dark-blue/25 bg-transparent px-3 text-[12px] font-semibold text-brand-dark-blue transition-colors duration-200 hover:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream active:scale-[0.98] motion-reduce:transition-none"
          >
            <MapPin aria-hidden="true" className="h-4 w-4" />
            Find a store
          </a>
          <a
            href="#aisles"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red px-3 text-[12px] font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream active:scale-[0.98] motion-reduce:transition-none"
          >
            <ShoppingCart aria-hidden="true" className="h-4 w-4" />
            Order groceries
          </a>
        </div>
      </nav>
    </div>
  );
}
