import React, { useState } from 'react';
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  CheckCircle2, 
  Building, 
  ShieldCheck, 
  FileText,
  Search
} from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  onTriggerAction: (prompt: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onTriggerAction,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'TRANSFER' | 'LENDING' | 'BILL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'TRANSFER' && act.category !== 'TRANSFER') return false;
    if (filter === 'LENDING' && act.category !== 'DISBURSEMENT' && act.category !== 'BALANCE_TRANSFER') return false;
    if (filter === 'BILL' && act.category !== 'BILL_PAY') return false;
    if (searchQuery) {
      return (
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <span>Activity & Executed Journeys</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of all AI-orchestrated banking transactions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['ALL', 'TRANSFER', 'LENDING', 'BILL'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === cat
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Activity' : cat === 'TRANSFER' ? 'Transfers' : cat === 'LENDING' ? 'Lending' : 'Bills'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
            No activity found for the selected filter.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    act.category === 'DISBURSEMENT'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : act.category === 'TRANSFER'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : act.category === 'BALANCE_TRANSFER'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {act.category === 'DISBURSEMENT' && <ArrowDownLeft className="w-5 h-5" />}
                  {act.category === 'TRANSFER' && <ArrowUpRight className="w-5 h-5" />}
                  {act.category === 'BALANCE_TRANSFER' && <Building className="w-5 h-5" />}
                  {act.category === 'BILL_PAY' && <CreditCard className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">{act.title}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                        act.status === 'COMPLETED' || act.status === 'DISBURSED' || act.status === 'PAID'
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{act.subtitle}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                    <span>{act.timestamp}</span>
                    <span>•</span>
                    <span>Ref: {act.referenceNumber}</span>
                  </div>
                </div>
              </div>

              {act.amount !== undefined && (
                <div className="text-left sm:text-right shrink-0">
                  <span
                    className={`text-base font-bold font-mono ${
                      act.category === 'DISBURSEMENT'
                        ? 'text-teal-300'
                        : act.category === 'TRANSFER' || act.category === 'BILL_PAY'
                        ? 'text-slate-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {act.category === 'DISBURSEMENT' ? '+' : act.category === 'TRANSFER' || act.category === 'BILL_PAY' ? '-' : ''}
                    ₹{act.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-[10px] text-slate-400">Zero fee processed</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
