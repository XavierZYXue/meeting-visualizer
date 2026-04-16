import { Calendar, CheckCircle2, Clock, Lightbulb, Target, User } from 'lucide-react';
import type { MeetingSummary } from '../../types';

interface MinimalStyleProps {
  summary: MeetingSummary;
}

export function MinimalStyle({ summary }: MinimalStyleProps) {
  const headerCard = summary.visualData.find(c => c.type === 'header');
  const summaryCard = summary.visualData.find(c => c.type === 'summary');
  const decisionsCard = summary.visualData.find(c => c.type === 'decisions');
  const actionsCard = summary.visualData.find(c => c.type === 'actions');
  const timelineCard = summary.visualData.find(c => c.type === 'timeline');

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-12 p-8 bg-white min-h-full max-w-3xl mx-auto">
      {/* Header */}
      {headerCard && (
        <header className="border-b-2 border-gray-900 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Meeting Summary
            </span>
          </div>
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">
            {headerCard.title}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">{headerCard.content}</p>
        </header>
      )}

      {/* Executive Summary */}
      {summaryCard && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {summaryCard.title}
            </h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed font-light">
            {summaryCard.content as string}
          </p>
        </section>
      )}

      {/* Key Decisions */}
      {decisionsCard && decisionsCard.content && Array.isArray(decisionsCard.content) && decisionsCard.content.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {decisionsCard.title}
            </h2>
          </div>
          <ul className="space-y-0">
            {decisionsCard.content.map((decision, index) => (
              <li 
                key={index} 
                className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-xs font-mono text-gray-300 mt-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-800">{decision}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Items */}
      {actionsCard && actionsCard.items && actionsCard.items.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {actionsCard.title}
            </h2>
          </div>
          <div className="border-t border-gray-200">
            {actionsCard.items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 py-5 border-b border-gray-100"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityDot(item.priority)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">{item.task}</p>
                  <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {item.owner}
                    </span>
                    {item.deadline && item.deadline !== 'Not specified' && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.deadline}
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {timelineCard && timelineCard.phases && timelineCard.phases.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {timelineCard.title}
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-0">
              {timelineCard.phases.map((phase, index) => (
                <div key={index} className="relative pl-8 py-5 border-b border-gray-100 last:border-b-0">
                  <div className="absolute left-0 top-6 w-2 h-2 bg-gray-900 rounded-full -translate-x-1/2" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-medium">{phase.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{phase.description}</p>
                      <p className="text-gray-400 text-xs mt-2">{phase.owner}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                      {phase.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Generated by Meeting Visualizer • {new Date().toLocaleDateString('en-US')}
        </p>
      </footer>
    </div>
  );
}
