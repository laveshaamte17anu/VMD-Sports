import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, ShoppingBag, Radio } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-lime/10 border-2 border-brand-lime flex items-center justify-center text-brand-lime mx-auto shadow-[0_0_40px_rgba(191,255,0,0.2)]">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <span className="font-mono text-5xl font-black text-brand-lime tracking-widest block mb-2">
            404
          </span>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white mb-2">
            Out Of The Ground!
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The ball was hit for six and lost outside the stadium! The page you're searching for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/merchandise"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors border border-white/10 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Merch
          </Link>
        </div>
      </div>
    </div>
  );
}
