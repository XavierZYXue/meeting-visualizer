import { Calendar, CheckCircle2, Clock, Lightbulb, Target, User } from 'lucide-react';
import type { MeetingSummary } from '../../types';

interface HandDrawnStyleProps {
  summary: MeetingSummary;
}

// Hand-drawn card component with sketchy borders
function SketchyCard({ children, accent = '#374151' }: { children: React.ReactNode; accent?: string }) {
  return (
    <div 
      className="bg-white p-6 relative"
      style={{
        border: `2px solid ${accent}`,
        borderRadius: '2px 255px 3px 25px / 255px 5px 225px 5px',
        boxShadow: '3px 4px 0 rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </div>
  );
}

// Sketchy circle for numbers/icons
function SketchyCircle({ children, bg = '#374151' }: { children: React.ReactNode; bg?: string }) {
  return (
    <div 
      className="w-10 h-10 flex items-center justify-center text-white font-bold"
      style={{
        background: bg,
        borderRadius: '50% 45% 55% 48% / 45% 50% 48% 55%',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
      }}
    >
      {children}
    </div>
  );
}

export function HandDrawnStyle({ summary }: HandDrawnStyleProps) {
  const headerCard = summary.visualData.find(c => c.type === 'header');
  const summaryCard = summary.visualData.find(c => c.type === 'summary');
  const decisionsCard = summary.visualData.find(c => c.type === 'decisions');
  const actionsCard = summary.visualData.find(c => c.type === 'actions');
  const timelineCard = summary.visualData.find(c => c.type === 'timeline');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#fca5a5', border: '#ef4444' };
      case 'medium': return { bg: '#fcd34d', border: '#f59e0b' };
      case 'low': return { bg: '#86efac', border: '#22c55e' };
      default: return { bg: '#e5e7eb', border: '#9ca3af' };
    }
  };

  return (
    <div className="space-y-8 p-8 bg-amber-50 min-h-full" style={{ fontFamily: 'Comic Sans MS, cursive, sans-serif' }}>
      {/* Header */}
      {headerCard && (
        <div 
          className="bg-white p-8 relative"
          style={{
            border: '3px solid #4b5563',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            boxShadow: '4px 5px 0 rgba(0,0,0,0.15)',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <div className="flex items-center gap-4">
            <SketchyCircle bg="#6366f1">
              <Lightbulb className="w-5 h-5" />
            </SketchyCircle>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Meeting Summary</p>
              <h1 className="text-3xl font-bold text-gray-800 mt-1">{headerCard.title}</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-4 ml-14">{headerCard.content}</p>
        </div>
      )}

      {/* Summary */}
      {summaryCard && (
        <SketchyCard accent="#8b5cf6">
          <div className="flex items-start gap-4">
            <SketchyCircle bg="#8b5cf6">
              <Target className="w-5 h-5" />
            </SketchyCircle>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{summaryCard.title}</h2>
              <p className="text-gray-600 leading-relaxed">{summaryCard.content as string}</p>
            </div>
          </div>
        </SketchyCard>
      )}

      {/* Key Decisions */}
      {decisionsCard && decisionsCard.content && Array.isArray(decisionsCard.content) && decisionsCard.content.length > 0 && (
        <SketchyCard accent="#10b981">
          <div className="flex items-center gap-3 mb-4">
            <SketchyCircle bg="#10b981">
              <CheckCircle2 className="w-5 h-5" />
            </SketchyCircle>
            <h2 className="text-xl font-bold text-gray-800">{decisionsCard.title}</h2>
          </div>
          <ul className="space-y-3 ml-2">
            {decisionsCard.content.map((decision, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 p-3 bg-green-50"
                style={{
                  border: '2px dashed #10b981',
                  borderRadius: '8px 12px 10px 6px',
                }}
              >
                <span 
                  className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ borderRadius: '50% 45% 55% 48%' }}
                >
                  {index + 1}
                </span>
                <span className="text-gray-700">{decision}</span>
              </li>
            ))}
          </ul>
        </SketchyCard>
      )}

      {/* Action Items */}
      {actionsCard && actionsCard.items && actionsCard.items.length > 0 && (
        <SketchyCard accent="#6366f1">
          <div className="flex items-center gap-3 mb-4">
            <SketchyCircle bg="#6366f1">
              <Target className="w-5 h-5" />
            </SketchyCircle>
            <h2 className="text-xl font-bold text-gray-800">{actionsCard.title}</h2>
          </div>
          <div className="space-y-3">
            {actionsCard.items.map((item, index) => {
              const colors = getPriorityColor(item.priority);
              return (
                <div 
                  key={index} 
                  className="p-4"
                  style={{
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px 8px 15px 10px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-800 font-semibold flex-1">{item.task}</p>
                    <span 
                      className="px-3 py-1 text-xs font-bold"
                      style={{
                        background: colors.bg,
                        color: colors.border,
                        border: `2px solid ${colors.border}`,
                        borderRadius: '12px 8px 10px 15px',
                      }}
                    >
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
              );
            })}
          </div>
        </SketchyCard>
      )}

      {/* Timeline */}
      {timelineCard && timelineCard.phases && timelineCard.phases.length > 0 && (
        <SketchyCard accent="#f59e0b">
          <div className="flex items-center gap-3 mb-6">
            <SketchyCircle bg="#f59e0b">
              <Clock className="w-5 h-5" />
            </SketchyCircle>
            <h2 className="text-xl font-bold text-gray-800">{timelineCard.title}</h2>
          </div>
          <div className="relative">
            {/* Hand-drawn timeline line */}
            <div 
              className="absolute left-6 top-0 bottom-0 w-1 bg-amber-300"
              style={{ 
                borderRadius: '100%',
                transform: 'translateX(-50%)',
              }}
            />
            <div className="space-y-6">
              {timelineCard.phases.map((phase, index) => (
                <div key={index} className="relative flex gap-4">
                  <div 
                    className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0"
                    style={{
                      borderRadius: '50% 45% 55% 48% / 45% 50% 48% 55%',
                      boxShadow: '2px 3px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div 
                    className="flex-1 bg-amber-50 p-4"
                    style={{
                      border: '2px solid #fbbf24',
                      borderRadius: '10px 15px 8px 12px',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-gray-800">{phase.name}</h3>
                      <span 
                        className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold"
                        style={{ borderRadius: '8px 12px 10px 6px' }}
                      >
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
        </SketchyCard>
      )}
    </div>
  );
}
