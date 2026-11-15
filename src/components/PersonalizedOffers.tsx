import React from 'react';
import { Tag, Sparkles, ArrowRight, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LENDING_OFFERS } from '../data/mockData';
import { LendingOffer } from '../types';

interface PersonalizedOffersProps {
  onSelectOfferPrompt: (prompt: string) => void;
  onOpenExplainability: (offerTitle: string) => void;
}

export const PersonalizedOffers: React.FC<PersonalizedOffersProps> = ({
  onSelectOfferPrompt,
  onOpenExplainability,
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-400" />
            <span>Pre-Qualified Financial Opportunities</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically computed using your 12-year ONE Bank history and 782 Bureau Rating
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-teal-300 bg-teal-950/30 px-3 py-1.5 rounded-xl border border-teal-800/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Paperwork Pre-Approvals</span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LENDING_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4 relative group shadow-lg shadow-black/30"
          >
            {/* Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                {offer.category}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
                {offer.badge}
              </span>
            </div>

            {/* Offer Main Info */}
            <div>
              <h3 className="text-base font-bold text-white font-display">{offer.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{offer.tagline}</p>

              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
                <span className="text-[11px] text-slate-400 block">Indicative Pre-Qualified Limit</span>
                <p className="text-2xl font-extrabold text-teal-300 font-display">
                  ₹{offer.eligibleAmount.toLocaleString('en-IN')}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Indicative Tenure</span>
                    <span className="font-semibold text-slate-200">{offer.indicativeTenure}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Interest Rate</span>
                    <span className="font-semibold text-slate-200">{offer.interestRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Recommended & CTA */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => onOpenExplainability(offer.title)}
                className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>Why am I seeing this?</span>
              </button>

              <button
                onClick={() => {
                  let prompt = `Tell me more about ${offer.title}`;
                  if (offer.category === 'Personal Loan' || offer.id.includes('pl')) prompt = 'I need a personal loan';
                  if (offer.id === 'offer_hl_bt') prompt = 'My home loan EMI is too high';
                  if (offer.id === 'offer_auto') prompt = 'I am exploring for an auto loan';
                  if (offer.id === 'offer_tractor') prompt = 'I want to buy a tractor';
                  if (offer.id === 'offer_cv') prompt = 'I am planning to buy a commercial vehicle';
                  onSelectOfferPrompt(prompt);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:scale-101"
              >
                <span>Apply / Explore via AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 text-center">
        *Indicative simulation. Final eligibility, pricing and terms are subject to bank credit policy and bureau verification.
      </div>
    </div>
  );
};
