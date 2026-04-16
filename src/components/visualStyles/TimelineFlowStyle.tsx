import { CheckCircle2, Clock, Flag, Play, Square, Target, User } from 'lucide-react';
import type { MeetingSummary } from '../../types';

interface TimelineFlowStyleProps {
  summary: MeetingSummary;
}

export function TimelineFlowStyle({ summary }: TimelineFlowStyleProps) {
  const decisions = summary.keyDecisions || [];
  const actions = summary.actionItems || [];
  const phases = summary.timeline || [];

  // Combine all items into a timeline
  const timelineItems = [
    { type: 'start', content: 'Meeting Started', icon: <Play className="w-5 h-5" /> },
    { type: 'summary', content: summary.summary, icon: <Flag className="w-5 h-5" /> },
    ...decisions.map(d => ({ type: 'decision', content: d, icon: <CheckCircle2 className="w-5 h-5" /> })),
    ...actions.map(a => ({ 
      type: 'action', 
      content: a.task, 
      owner: a.owner,
      deadline: a.deadline,
      priority: a.priority,
      icon: <Target className="w-5 h-5" /> 
    })),
    ...phases.map(p => ({ 
      type: 'phase', 
      content: p.name, 
      duration: p.duration,
      owner: p.owner,
      icon: <Clock className="w-5 h-5" /> 
    })),
    { type: 'end', content: 'Meeting Ended', icon: <Square className="w-5 h-5" /> },
  ];

  const getItemColor = (type: string, priority?: string) => {
    if (priority === 'high') return { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-900', icon: 'text-rose-600' };
    if (priority === 'medium') return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', icon: 'text-amber-600' };
    if (priority === 'low') return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', icon: 'text-green-600' };
    
    switch (type) {
      case 'start': return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', icon: 'text-emerald-600' };
      case 'end': return { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-900', icon: 'text-rose-600' };
      case 'decision': return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', icon: 'text-blue-600' };
      case 'action': return { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-900', icon: 'text-indigo-600' };
      case 'phase': return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', icon: 'text-purple-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', icon: 'text-gray-600' };
    }
  };

  return (
    <div className="p-8 bg-white min-h-full">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{summary.title}</h1>
        <p className="text-gray-500">Timeline Flow • {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-indigo-300 to-rose-300" />
          
          {/* Timeline items */}
          <div className="space-y-6">
            {timelineItems.map((item, index) => {
              const colors = getItemColor(item.type, (item as {priority?: string}).priority);
              const isStart = item.type === 'start';
              const isEnd = item.type === 'end';
              
              return (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Node on timeline */}
                  <div 
                    className={`
                      relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                      border-4 ${colors.bg} ${colors.border}
                      ${isStart || isEnd ? 'ring-4 ring-offset-2 ring-gray-100' : ''}
                    `}
                  >
                    <span className={colors.icon}>{item.icon}</span>
                  </div>
                  
                  {/* Content card */}
                  <div className={`
                    flex-1 p-4 rounded-xl border-2 ${colors.bg} ${colors.border}
                    ${isStart || isEnd ? 'shadow-lg' : 'shadow-sm'}
                  `}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`${colors.text} ${isStart || isEnd ? 'font-bold text-lg' : 'font-medium'}`}>
                          {item.content}
                        </p>
                        
                        {/* Action item details */}
                        {(item.type === 'action' || item.type === 'phase') && (
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            {(item as {owner?: string}).owner && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <User className="w-3.5 h-3.5" />
                                {(item as {owner?: string}).owner}
                              </span>
                            )}
                            {(item as {deadline?: string; duration?: string}).deadline && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3.5 h-3.5" />
                                {(item as {deadline?: string}).deadline}
                              </span>
                            )}
                            {(item as {duration?: string}).duration && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3.5 h-3.5" />
                                {(item as {duration?: string}).duration}
                              </span>
                            )}
                            {(item as {priority?: string}).priority && (
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs font-medium uppercase
                                ${(item as {priority?: string}).priority === 'high' ? 'bg-rose-200 text-rose-800' : 
                                  (item as {priority?: string}).priority === 'medium' ? 'bg-amber-200 text-amber-800' : 
                                  'bg-green-200 text-green-800'}
                              `}>
                                {(item as {priority?: string}).priority}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Step number */}
                      <span className="text-xs font-mono text-gray-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-12 max-w-3xl mx-auto grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-emerald-50 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">{decisions.length}</p>
          <p className="text-sm text-emerald-700">Decisions</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-xl">
          <p className="text-2xl font-bold text-indigo-600">{actions.length}</p>
          <p className="text-sm text-indigo-700">Actions</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl">
          <p className="text-2xl font-bold text-purple-600">{phases.length}</p>
          <p className="text-sm text-purple-700">Phases</p>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{actions.filter(a => a.priority === 'high').length}</p>
          <p className="text-sm text-amber-700">High Priority</p>
        </div>
      </div>
    </div>
  );
}
