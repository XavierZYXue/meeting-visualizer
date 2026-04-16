import { useState } from 'react';
import { ChevronDown, ChevronRight, Target, CheckCircle2, Clock, User, Lightbulb } from 'lucide-react';
import type { MeetingSummary } from '../../types';

interface MindMapStyleProps {
  summary: MeetingSummary;
}

interface NodeProps {
  title: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  expanded?: boolean;
  onToggle?: () => void;
  isRoot?: boolean;
}

function MindMapNode({ title, children, icon, color = '#6366f1', expanded = true, onToggle, isRoot = false }: NodeProps) {
  const hasChildren = !!children;
  
  return (
    <div className="flex flex-col">
      <div 
        className={`
          flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer
          transition-all hover:shadow-md
          ${isRoot ? 'text-lg font-bold' : 'text-sm font-medium'}
        `}
        style={{ 
          backgroundColor: `${color}15`, 
          borderColor: `${color}40`,
          color: color 
        }}
        onClick={onToggle}
      >
        {hasChildren && (
          <span className="text-gray-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="text-gray-800">{title}</span>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-6 mt-2 pl-4 border-l-2 border-gray-200 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Branch({ 
  title, 
  items, 
  color, 
  icon 
}: { 
  title: string; 
  items: string[] | Array<{text: string; subtext?: string}>; 
  color: string;
  icon: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="relative">
      {/* Branch line */}
      <div 
        className="absolute -left-4 top-6 w-4 h-0.5"
        style={{ backgroundColor: color }}
      />
      
      <MindMapNode 
        title={title} 
        icon={icon}
        color={color}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <div className="space-y-2">
          {items.map((item, index) => {
            const text = typeof item === 'string' ? item : item.text;
            const subtext = typeof item === 'object' ? item.subtext : undefined;
            
            return (
              <div 
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-100"
              >
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p className="text-gray-700 text-sm">{text}</p>
                  {subtext && <p className="text-gray-400 text-xs mt-0.5">{subtext}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </MindMapNode>
    </div>
  );
}

export function MindMapStyle({ summary }: MindMapStyleProps) {
  const [rootExpanded, setRootExpanded] = useState(true);
  
  const decisions = summary.keyDecisions || [];
  const actions = summary.actionItems || [];
  const phases = summary.timeline || [];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{summary.title}</h1>
        <p className="text-gray-500">Mind Map Visualization</p>
      </div>

      {/* Mind Map Container */}
      <div className="max-w-4xl mx-auto">
        {/* Root Node */}
        <div className="flex justify-center mb-8">
          <div 
            className="px-8 py-4 rounded-2xl border-4 cursor-pointer transition-all hover:shadow-xl"
            style={{ 
              backgroundColor: '#6366f120', 
              borderColor: '#6366f1',
            }}
            onClick={() => setRootExpanded(!rootExpanded)}
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Meeting Summary</h2>
                <p className="text-sm text-gray-600 mt-1 max-w-md">{summary.summary}</p>
              </div>
              <span className="text-indigo-400">
                {rootExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </span>
            </div>
          </div>
        </div>

        {/* Branches */}
        {rootExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Decisions Branch */}
            {decisions.length > 0 && (
              <Branch 
                title="Key Decisions"
                items={decisions}
                color="#10b981"
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
            )}

            {/* Actions Branch */}
            {actions.length > 0 && (
              <Branch 
                title="Action Items"
                items={actions.map(a => ({ 
                  text: a.task, 
                  subtext: `${a.owner}${a.deadline ? ' • ' + a.deadline : ''} • ${a.priority}` 
                }))}
                color="#6366f1"
                icon={<Target className="w-5 h-5" />}
              />
            )}

            {/* Timeline Branch */}
            {phases.length > 0 && (
              <Branch 
                title="Timeline"
                items={phases.map(p => ({ 
                  text: p.name, 
                  subtext: `${p.duration} • ${p.owner}` 
                }))}
                color="#f59e0b"
                icon={<Clock className="w-5 h-5" />}
              />
            )}

            {/* Participants Branch */}
            {actions.length > 0 && (
              <Branch 
                title="Participants"
                items={[...new Set(actions.map(a => a.owner))].map(name => ({ text: name }))}
                color="#8b5cf6"
                icon={<User className="w-5 h-5" />}
              />
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400">
          Click on any node to expand or collapse
        </p>
      </div>
    </div>
  );
}
