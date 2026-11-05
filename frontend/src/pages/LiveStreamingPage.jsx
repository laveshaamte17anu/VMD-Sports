import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio, Video, Camera, Tv, MonitorPlay, Wifi, Layers,
  Phone, MessageSquare, CheckCircle, Shield, Play, Trophy,
  Flame, Award, ArrowRight, ExternalLink
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const broadcastFeatures = [
  {
    icon: Tv,
    title: 'Multi-Camera Broadcast',
    desc: 'Up to 6-camera live switching with bowler end, batsman crease, high-30m tower & boundary roaming angles.'
  },
  {
    icon: MonitorPlay,
    title: 'Live Animated Graphics & Scoreboard',
    desc: 'Real-time scorecard overlays, player career stats, wagon wheels, worm charts and boundary celebration stingers.'
  },
  {
    icon: Video,
    title: 'Instant Multi-Speed Replays',
    desc: 'Slow-motion 1080p60 action replays for run-outs, close LBWs, boundary saves and high catches within seconds.'
  },
  {
    icon: Wifi,
    title: 'Redundant Bonded 4G/5G Uplink',
    desc: 'Zero-drop multi-SIM cellular bonding streaming smoothly to YouTube, Facebook, CricHeroes, or custom OTT platforms.'
  },
  {
    icon: Layers,
    title: 'Commentary & Stadium Audio Mix',
    desc: 'Wireless mic sets for on-pitch and studio commentary with stump mic audio realism.'
  },
  {
    icon: Award,
    title: 'Sponsor Branding Integration',
    desc: 'Custom sponsor logos, L-bands, boundary animations, and presentation ceremony graphic suites.'
  }
];

const cameraGear = [
  {
    name: 'Sony FX6 / FX3 Cinema Rigs',
    role: 'Pitch & Close-up Action',
    specs: 'Full-frame sensors with 4K 120fps capability for crisp slow-motion replays and shallow depth-of-field portraits.'
  },
  {
    name: 'Sony G-Master 200-600mm Lenses',
    role: 'Long Boundary Zoom',
    specs: 'Capturing ball trajectory, batsman footwork, and bowler release seam angle from 80 meters away.'
  },
  {
    name: 'Blackmagic ATEM Mini Extreme ISO',
    role: 'Live Production Switcher',
    specs: 'Hardware broadcast switching with dual hardware encoders and multi-channel isolated backup recording.'
  },
  {
    name: 'DJI Ronin Gimbal & Wireless Video',
    role: 'Roaming Boundary & Dugout',
    specs: 'Low-latency wireless SDI transmitter for real-time wicket celebrations, dugout reactions, and toss coverage.'
  }
];

const coveragePackages = [
  {
    name: 'Standard Match Stream',
    badge: 'Club Matches',
    cameras: '2-Camera HD Setup',
    details: [
      'Dual HD Camera Coverage (Main Pitch + Follow-up)',
      'Digital Live Scoreboard Integration',
      'Dual Wireless Commentary Mics',
      'Full Match Recording in 1080p',
      'Direct YouTube / Facebook Streaming'
    ]
  },
  {
    name: 'Pro Tournament Broadcast',
    badge: 'Popular',
    cameras: '4-Camera Cinema Setup',
    highlight: true,
    details: [
      '4 Cinema Cameras (Pitch, Follow, Roaming, High-Angle)',
      'Instant Slow-Motion Replay System',
      'Animated Television-Grade Scoreboard & Lower Thirds',
      'Sponsor L-Bands & Commercial Placements',
      'Multi-Platform Simultaneous Streaming',
      'Post-match Highlight Reel Package'
    ]
  },
  {
    name: 'Championship Grand Finale',
    badge: 'State & Corporate',
    cameras: '6-Camera Full Production',
    details: [
      '6 Cinema Cameras + Drone Flyover Integration',
      'Dedicated Replay Operator & Graphics Director',
      'Multi-Language Commentary Booth Setup',
      'Presentation Ceremony Studio Coverage',
      'Same-Day 4K Edited Reels & Player Clips',
      'Full Technical Redundancy (Bonded Uplink)'
    ]
  }
];

const pastProjects = [
  {
    title: 'Mumbai Corporate Premier League 2026',
    teams: '32 Corporate Teams • 48 Matches',
    views: '120K+ Live Views',
    platform: 'YouTube Live & CricHeroes',
    image: '/images/vmd_tournament_coverage.jpg'
  },
  {
    title: 'State Championship Trophy - Day/Night Final',
    teams: 'Floodlight Match • High Octane T20',
    views: '85K+ Live Peak Viewers',
    platform: 'VMD Sports Channel & Facebook',
    image: '/images/gallery_ground_atmosphere.jpg'
  },
  {
    title: 'Junior Super League All-Star Weekend',
    teams: 'U-19 Rising Stars • 3 Ground Simultaneous',
    views: '60K+ Viewers',
    platform: 'YouTube Broadcast',
    image: '/images/gallery_batsman_shot.jpg'
  }
];

export default function LiveStreamingPage() {
  const { settings } = useSettings();

  // The Live Streaming contact number must be configurable separately from the merchandise purchase number.
  const livestreamWhatsApp = settings.livestreamWhatsApp || settings.generalPhone || '';
  const livestreamPhone = settings.generalPhone || '';

  const waLink = livestreamWhatsApp
    ? `https://wa.me/${livestreamWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello VMD Sports, I would like to inquire about booking cricket Live Streaming services for an upcoming match/tournament.')}`
    : '#';

  const telLink = livestreamPhone ? `tel:${livestreamPhone.replace(/[^0-9+]/g, '')}` : '#';

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">

      {/* ─── Hero Section with Stadium Visual ─── */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/vmd_broadcast_livestream.jpg"
            alt="Cricket Stadium Floodlights"
            className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-brand-dark" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-sport uppercase tracking-wider mb-6">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Broadcast Production Division
            </div>

            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-wider text-white mb-6 leading-tight">
              Broadcast-Grade <span className="text-brand-lime">Live Streaming</span> For Cricket Tournaments
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
              Turn your local cricket matches and premier tournaments into television-quality broadcasts. Multi-camera switching, instant slow-motion replays, animated scorecards, and seamless 1080p streaming.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {livestreamWhatsApp ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl bg-[#25D366] text-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all shadow-[0_0_30px_rgba(37,211,102,0.3)] flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Chat on WhatsApp For Streaming
                </a>
              ) : null}

              {livestreamPhone ? (
                <a
                  href={telLink}
                  className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-sm font-bold transition-all border border-white/20 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call: {livestreamPhone}
                </a>
              ) : null}

              <Link
                to="/book-cameraman"
                className="px-8 py-4 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all flex items-center gap-2 shadow-lg"
              >
                Book Cameraman & Stream
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Service Features ─── */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Television-Grade Capabilities</span>
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
              Why VMD Sports Streams Stand Out
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {broadcastFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-brand-black border border-white/10 hover:border-brand-lime/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime mb-5 group-hover:scale-110 group-hover:bg-brand-lime group-hover:text-black transition-all">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-sport uppercase text-lg text-white tracking-wider mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Professional Camera Setup Showcase ─── */}
      <section className="py-20 border-b border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Hardware & Optics</span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
                Professional Camera Setup Showcase
              </h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md">
              We never stream with consumer webcams or mobile phones. We deploy dedicated cinema rigs engineered for high-velocity sports tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cameraGear.map((item, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-brand-black border border-white/10 hover:border-brand-lime/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-sport uppercase px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20 font-bold">
                      {item.role}
                    </span>
                    <Camera className="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {item.specs}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-brand-lime font-mono">
                  <CheckCircle className="w-4 h-4" />
                  Broadcast Compliant SDI/HDMI 4K
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Match Coverage Packages ─── */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Tailored Production Packages</span>
            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
              Choose Your Coverage Scale
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {coveragePackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl flex flex-col justify-between transition-all relative ${
                  pkg.highlight
                    ? 'bg-brand-black border-2 border-brand-lime shadow-[0_0_40px_rgba(191,255,0,0.15)]'
                    : 'bg-brand-black border border-white/10'
                }`}
              >
                {pkg.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-lime text-black font-sport uppercase tracking-widest text-[10px] font-black">
                    Most Popular Choice
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-sport uppercase tracking-wider text-gray-400">{pkg.badge}</span>
                    <span className="font-mono text-xs text-brand-lime">{pkg.cameras}</span>
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-6">
                    {pkg.name}
                  </h3>

                  <ul className="space-y-3 mb-8">
                    {pkg.details.map((dt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                        <span>{dt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {livestreamWhatsApp ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3.5 px-4 rounded-xl font-sport uppercase tracking-wider text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        pkg.highlight
                          ? 'bg-brand-lime text-black hover:bg-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      Inquire Custom Package
                    </a>
                  ) : (
                    <Link
                      to="/book-cameraman"
                      className="w-full py-3.5 px-4 rounded-xl font-sport uppercase tracking-wider text-xs font-bold bg-brand-lime text-black hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      Request Quote
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Previous Streaming Project Gallery ─── */}
      <section className="py-20 border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-2">Track Record</span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white">
                Previous Streaming Projects
              </h2>
            </div>
            <Link
              to="/youtube"
              className="inline-flex items-center gap-2 text-xs font-sport uppercase tracking-wider text-brand-lime hover:text-white transition-colors"
            >
              Watch Highlights on YouTube
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastProjects.map((proj, idx) => (
              <div
                key={idx}
                className="group rounded-2xl bg-brand-black border border-white/10 overflow-hidden hover:border-brand-lime/40 transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono text-brand-lime border border-white/10">
                      {proj.views}
                    </span>
                    <span className="text-[10px] uppercase font-sport tracking-widest text-gray-300 bg-black/60 px-2 py-0.5 rounded">
                      {proj.platform}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base mb-1 group-hover:text-brand-lime transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">{proj.teams}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Full 1080p Stream Archive</span>
                    <Play className="w-3.5 h-3.5 text-brand-lime" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact CTA Banner ─── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-lime/20 via-brand-black to-brand-black border border-brand-lime/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-[0_0_60px_rgba(191,255,0,0.1)]">
            <div className="max-w-2xl mx-auto">
              <span className="text-xs font-sport uppercase tracking-widest text-brand-lime block mb-3">Live Streaming Hotline</span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-wider text-white mb-4">
                Ready To Stream Your Next Cricket Match?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
                Tell us your ground location, dates, and tournament format. Our technical director will provide a full equipment roadmap and transparent quote.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {livestreamWhatsApp ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-xl bg-[#25D366] text-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all shadow-lg flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    Chat on WhatsApp
                  </a>
                ) : null}

                {livestreamPhone ? (
                  <a
                    href={telLink}
                    className="px-8 py-4 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all shadow-lg flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Direct Call: {livestreamPhone}
                  </a>
                ) : null}

                <Link
                  to="/contact"
                  className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-sm font-bold transition-all border border-white/20"
                >
                  Send Inquiry Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
