import { Palette, Pencil, Layers, GitBranch, Network, Timer, Box } from 'lucide-react';
import type { VisualStyle } from '../types';

interface StyleSelectorProps {
  currentStyle: VisualStyle;
  onStyleChange: (style: VisualStyle) => void;
}

const styles: { id: VisualStyle; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'System architecture with layers and data flow',
    icon: <Box className="w-5 h-5" />
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Process flow with decisions and swimlanes',
    icon: <GitBranch className="w-5 h-5" />
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Radial tree structure with branches',
    icon: <Network className="w-5 h-5" />
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Vertical timeline with connected nodes',
    icon: <Timer className="w-5 h-5" />
  },
  {
    id: 'modern',
    name: 'Modern Cards',
    description: 'Clean gradients and professional cards',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'handdrawn',
    name: 'Hand Drawn',
    description: 'Sketch-like aesthetic with organic borders',
    icon: <Pencil className="w-5 h-5" />
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Typography-focused with elegant spacing',
    icon: <Layers className="w-5 h-5" />
  }
];

export function StyleSelector({ currentStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Visual Style
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`
              flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
              ${currentStyle === style.id 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${currentStyle === style.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              {style.icon}
            </div>
            <div>
              <p className={`font-medium ${currentStyle === style.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                {style.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{style.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
