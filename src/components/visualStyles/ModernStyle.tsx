import { Calendar, CheckCircle2, Clock, Lightbulb, Target, User } from 'lucide-react';
import type { MeetingSummary, VisualCard } from '../../types';

interface ModernStyleProps {
  summary: MeetingSummary;
}

function Card({ card, children }: { card: VisualCard; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    '#6366f1': 'from-indigo-500 to-purple-600',
    '#10b981': 'from-emerald-500 to-teal-600',
    '#f59e0b': 'from-amber-500 to-orange-600',
    '#8b5cf6': 'from-violet-500 to-purple-600',
    '#ef4444': 'from-red-500 to-rose-600',
  };

  const gradient = colors[card.accent || '#6366f1'] || 'from-indigo-500 to-purple-600';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function ModernStyle({ summary }: ModernStyleProps) {
  const headerCard = summary.visualData.find(c => c.type === 'header');
  const summaryCard = summary.visualData.find(c => c.type === 'summary');
  const decisionsCard = summary.visualData.find(c => c.type === 'decisions');
  const actionsCard = summary.visualData.find(c => c.type === 'actions');
  const timelineCard = summary.visualData.find(c => c.type === 'timeline');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {/* Header Section */}
      {headerCard && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">
                  Meeting Summary
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">{headerCard.title}</h1>
              </div>
            </div>
            <p className="text-indigo-100">{headerCard.content}</p>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {summaryCard && (
        <Card card={summaryCard}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{summaryCard.title}</h2>
              <p className="text-gray-600 leading-relaxed">{summaryCard.content as string}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Decisions */}
      {decisionsCard && decisionsCard.content && Array.isArray(decisionsCard.content) && decisionsCard.content.length > 0 && (
        <Card card={decisionsCard}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{decisionsCard.title}</h2>
          </div>
          <ul className="space-y-3">
            {decisionsCard.content.map((decision, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{decision}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Items */}
      {actionsCard && actionsCard.items && actionsCard.items.length > 0 && (
        <Card card={actionsCard}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{actionsCard.title}</h2>
          </div>
          <div className="space-y-3">
            {actionsCard.items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-800 font-medium flex-1">{item.task}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {item.owner}
                  </span>
                  {item.deadline && item.deadline !== 'Not specified' && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      {timelineCard && timelineCard.phases && timelineCard.phases.length > 0 && (
        <Card card={timelineCard}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{timelineCard.title}</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 to-amber-100" />
            <div className="space-y-6">
              {timelineCard.phases.map((phase, index) => (
                <div key={index} className="relative flex gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold z-10 flex-shrink-0 shadow-lg shadow-amber-500/30">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-amber-50/50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{phase.description}</p>
                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" /> {phase.owner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
