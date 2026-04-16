import { Palette, Pencil, Layers, GitBranch, Network, Timer, Box, ChevronDown } from 'lucide-react';
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
    icon: <Box className="w-4 h-4" />
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Process flow with decisions and swimlanes',
    icon: <GitBranch className="w-4 h-4" />
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Radial tree structure with branches',
    icon: <Network className="w-4 h-4" />
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Vertical timeline with connected nodes',
    icon: <Timer className="w-4 h-4" />
  },
  {
    id: 'modern',
    name: 'Modern Cards',
    description: 'Clean gradients and professional cards',
    icon: <Palette className="w-4 h-4" />
  },
  {
    id: 'handdrawn',
    name: 'Hand Drawn',
    description: 'Sketch-like aesthetic with organic borders',
    icon: <Pencil className="w-4 h-4" />
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Typography-focused with elegant spacing',
    icon: <Layers className="w-4 h-4" />
  }
];

export function StyleSelector({ currentStyle, onStyleChange }: StyleSelectorProps) {
  const currentStyleObj = styles.find(s => s.id === currentStyle);

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Visual Style
      </h3>
      <div className="relative">
        <select
          value={currentStyle}
          onChange={(e) => onStyleChange(e.target.value as VisualStyle)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        >
          {styles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {currentStyleObj && (
        <p className="text-xs text-gray-500 mt-2">
          {currentStyleObj.description}
        </p>
      )}
    </div>
  );
}
