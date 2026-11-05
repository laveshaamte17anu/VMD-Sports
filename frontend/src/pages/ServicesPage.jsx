import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, Video, Radio, Scissors, Film, Trophy,
  CheckCircle, ArrowRight, Phone, MessageSquare, Sparkles
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const servicesList = [
  {
    id: 'cricket-photography',
    title: 'Cricket Photography',
    tagline: 'High-Velocity Stills & Emotion',
    badge: 'Flagship Media',
    icon: Camera,
    image: '/images/vmd_cricket_photography.jpg',
    description: 'We capture split-second seam releases, airborne diving catches, batsman celebrations, and official team line-ups using specialized high-burst Sony telephoto optics.',
    deliverables: [
      'High-resolution raw & color-graded photographs in 4K',
      'Individual player profile portraits & headshots',
      'Toss, awards presentation, and podium ceremony shots',
      'Fast 24-48 hour delivery via secure cloud link'
    ],
    primaryCta: { label: 'Book Photography Crew', to: '/book-cameraman' },
    secondaryCta: { label: 'View Photo Gallery', to: '/gallery' }
  },
  {
    id: 'match-videography',
    title: 'Match Videography',
    tagline: 'Cinematic Multi-Angle Pitch Coverage',
    badge: 'Cinema Rigs',
    icon: Video,
    image: '/images/vmd_cricket_videography.jpg',
    description: 'Full match recording in crystal clear 1080p60 / 4K. Dual camera coverage tracking every delivery from bowler release to boundary ropes with buttery-smooth pans.',
    deliverables: [
      'Dedicated bowler-crease and follow-through camera angles',
      'Run-out and close-stumping angle tracking',
      'Umpire signal and captain strategy coverage',
      'Full unedited archival copy of every ball bowled'
    ],
    primaryCta: { label: 'Book Videographer', to: '/book-cameraman' },
    secondaryCta: { label: 'Contact Us', to: '/contact' }
  },
  {
    id: 'live-streaming',
    title: 'Live Streaming',
    tagline: 'Television-Grade Digital Broadcast',
    badge: 'Multi-Camera',
    icon: Radio,
    image: '/images/vmd_broadcast_livestream.jpg',
    description: 'Broadcast your tournament live to thousands of passionate fans worldwide on YouTube, Facebook, or CricHeroes with live scorecard overlays and commentary.',
    deliverables: [
      '2 to 6 camera hardware switcher production',
      'Instant slow-motion replay system (1080p60)',
      'Real-time animated scorecards and player stat graphics',
      'Dual wireless commentary microphones and bonded 4G/5G uplink'
    ],
    primaryCta: { label: 'Explore Live Streaming', to: '/live-streaming' },
    secondaryCta: { label: 'Inquire Live Stream', to: '/contact' }
  },
  {
    id: 'video-editing',
    title: 'Video Editing & Post-Production',
    tagline: 'Dynamic Sports Storytelling',
    badge: 'Post-Production',
    icon: Scissors,
    image: '/images/vmd_cameraman_about.jpg',
    description: 'Transforming hours of raw footage into adrenaline-fueled vertical reels for Instagram, player recruitment mixtapes, and tournament recap mini-documentaries.',
    deliverables: [
      'Fast-paced 9:16 vertical reels with trending sound design',
      'Player highlight reels with slow-mo zoom and tracking badges',
      'Custom color grading matching team jersey colors',
      'Sponsor billboard & logo animated stingers'
    ],
    primaryCta: { label: 'Order Video Edit', to: '/contact' },
    secondaryCta: { label: 'Watch YouTube Reels', to: '/youtube' }
  },
  {
    id: 'match-highlights',
    title: 'Match Highlights Packages',
    tagline: 'Key Moments Compressed In Minutes',
    badge: 'Fan Favorite',
    icon: Film,
    image: '/images/vmd_tournament_coverage.jpg',
    description: 'Compressed 10 to 15 minute match highlight packages containing every boundary, wicket, controversial decision, and pivotal turning point of the game.',
    deliverables: [
      'Over-by-over condensed match package with scorecard',
      'Key wicket montage with multiple slow-mo angles',
      'Post-match player interview snippets',
      'Formatted for immediate YouTube release'
    ],
    primaryCta: { label: 'Book Highlight Coverage', to: '/book-cameraman' },
    secondaryCta: { label: 'Browse Videos', to: '/youtube' }
  },
  {
    id: 'tournament-coverage',
    title: 'Cricket Tournament Coverage',
    tagline: 'End-To-End Media Management',
    badge: 'Complete Solution',
    icon: Trophy,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
    description: 'Complete media partnership for your entire league or championship. From captain photoshoot media day and opening ceremony to grand finale presentation stage.',
    deliverables: [
      'Multi-ground simultaneous photography and live streaming',
      'Tournament branding collateral & sponsor promotion clips',
      'Daily social media graphics and top-performer posters',
      'Dedicated on-site production director'
    ],
    primaryCta: { label: 'Inquire Tournament Partnership', to: '/contact' },
    secondaryCta: { label: 'Book Cameramen', to: '/book-cameraman' }
  }
];

export default function ServicesPage() {
  const { settings } = useSettings();
  const livestreamWhatsApp = settings.livestreamWhatsApp || settings.purchaseWhatsApp || '';

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Media & Broadcast Solutions
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider mb-4">
            Our Cricket <span className="text-brand-lime">Services</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Professional sports media solutions crafted exclusively for cricketers, tournament organizers, corporate leagues, and academies.
          </p>
        </div>

        {/* ─── Services List (Alternating Layout) ─── */}
        <div className="space-y-16 mb-20">
          {servicesList.map((service, idx) => {
            const isEven = idx % 2 === 0;
            const IconComponent = service.icon;

            return (
              <div
                key={service.id}
                id={service.id}
                className="rounded-3xl bg-brand-black border border-white/10 overflow-hidden shadow-2xl hover:border-brand-lime/30 transition-all duration-300"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${isEven ? '' : 'lg:flex-row-reverse'}`}>

                  {/* Image Column (5 Cols) */}
                  <div className={`lg:col-span-5 relative min-h-[300px] lg:min-h-full overflow-hidden ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-brand-lime/30 text-[11px] font-sport uppercase tracking-wider text-brand-lime font-bold">
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  {/* Text Details Column (7 Cols) */}
                  <div className={`lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="font-sport uppercase tracking-widest text-xs text-brand-lime">
                          {service.tagline}
                        </span>
                      </div>

                      <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white mb-4">
                        {service.title}
                      </h2>

                      <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div className="space-y-2.5 mb-8">
                        <span className="text-xs font-sport uppercase tracking-wider text-gray-400 block mb-2">
                          Key Deliverables:
                        </span>
                        {service.deliverables.map((del, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-4">
                      <Link
                        to={service.primaryCta.to}
                        className="px-6 py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md flex items-center gap-2"
                      >
                        {service.primaryCta.label}
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to={service.secondaryCta.to}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors border border-white/10"
                      >
                        {service.secondaryCta.label}
                      </Link>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Bottom CTA Box ─── */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-black via-brand-black to-brand-lime/10 border border-brand-lime/30 p-8 sm:p-12 text-center">
          <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white mb-3">
            Need A Custom Tournament Package?
          </h3>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
            Let's design a custom setup combining live streaming, dedicated boundary photographers, and player highlight reels for your upcoming league.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book-cameraman"
              className="px-8 py-3.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-lg"
            >
              Book Cameraman Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-all border border-white/20"
            >
              Contact Our Media Desk
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
