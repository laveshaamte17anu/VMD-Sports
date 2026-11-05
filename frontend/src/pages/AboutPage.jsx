import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Camera, Video, Radio, ShoppingBag, ShieldCheck,
  Target, Award, Users, HeartHandshake, ArrowRight, Zap
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const coreValues = [
  {
    icon: Target,
    title: 'Relentless Precision',
    desc: 'Cricket is decided by millimeters. Our operators understand field placements and anticipating strokes before the ball leaves the hand.'
  },
  {
    icon: Trophy,
    title: 'Broadcasting Standards',
    desc: 'Bringing television-grade slow-motion replays, animated scorecard graphics, and high-fidelity audio to grassroot and corporate cricket.'
  },
  {
    icon: ShoppingBag,
    title: 'Elite Athlete Apparel',
    desc: 'Engineered sports apparel built for hot Indian summers, high-velocity running between wickets, and sweat-wicking breathability.'
  },
  {
    icon: HeartHandshake,
    title: 'Transparency & Trust',
    desc: 'Clear upfront quotations, timely media handover, and dedicated support for every club and tournament organizer.'
  }
];

const milestones = [
  { year: '2021', title: 'The First Match', desc: 'Started with single-camera match filming for local club tournaments in Mumbai.' },
  { year: '2023', title: 'Live Streaming Division', desc: 'Launched multi-camera broadcast units with animated scoreboards and instant replays.' },
  { year: '2024', title: 'Merchandise Line Launch', desc: 'Introduced high-performance VMD track suits, jerseys, and compression wear.' },
  { year: '2026', title: 'Premier Sports Network', desc: 'Over 500+ matches covered, 50+ leagues partnered, and national apparel distribution.' }
];

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">

      {/* ─── Hero Section with Stadium Visual ─── */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/vmd_hero_batsman.jpg"
            alt="Cricket Stadium"
            className="w-full h-full object-cover opacity-20 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            The VMD Sports Story
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-wider text-white mb-6 leading-tight">
            Behind Every Great Match, <span className="text-brand-lime">There's A Story.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            VMD Sports was founded with a single mission: to give every cricket match, from grassroots weekend derbies to prestigious championship leagues, the cinematic glory it deserves.
          </p>
        </div>
      </section>

      {/* ─── Mission & Vision ─── */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Our Core DNA</span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white mb-6">
                Redefining Cricket Media & Lifestyle
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                In standard sports media, only international matches receive world-class multi-angle replays and elite apparel. We believe every aspiring cricketer deserves to look, feel, and be captured like a professional athlete.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Today, VMD Sports stands as an integrated ecosystem combining cinema-grade broadcast coverage, cameraman hire services, high-speed photography, and athlete-engineered sports apparel.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <span className="font-display text-3xl sm:text-4xl text-brand-lime block">500+</span>
                  <span className="text-xs uppercase text-gray-400 tracking-wider">Matches Covered</span>
                </div>
                <div>
                  <span className="font-display text-3xl sm:text-4xl text-brand-lime block">100K+</span>
                  <span className="text-xs uppercase text-gray-400 tracking-wider">Live Viewers Engaged</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="/images/vmd_cameraman_about.jpg"
                alt="Cricket match action"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-brand-lime text-black font-sport uppercase text-[10px] font-bold inline-block mb-2">
                  Uncompromising Quality
                </span>
                <p className="font-sport uppercase text-sm text-white tracking-wider">
                  Sony Cinema Line • Telephoto 600mm Optics • Bonded 5G Streaming
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="py-20 border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">What We Stand For</span>
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
              The VMD Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-brand-black border border-white/10 hover:border-brand-lime/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime mb-5">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="font-sport uppercase text-base text-white tracking-wider mb-2">
                      {val.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Milestones Roadmap ─── */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Our Evolution</span>
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
              The Growth Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-brand-black border border-white/10 relative"
              >
                <span className="font-mono text-3xl font-black text-brand-lime block mb-2">
                  {m.year}
                </span>
                <h4 className="font-bold text-white text-base mb-2">{m.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white mb-6">
            Join The VMD Sports Movement
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Whether you want your match covered by cinema lenses or you're gearing up with premium sportswear, we have you covered.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/merchandise"
              className="px-8 py-4 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-lg"
            >
              Explore Merchandise
            </Link>
            <Link
              to="/book-cameraman"
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-all border border-white/20"
            >
              Book Cameraman
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
