import { Download, Image as ImageIcon, FileJson, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import type { MeetingSummary, VisualStyle } from '../types';
import { ModernStyle } from './visualStyles/ModernStyle';
import { HandDrawnStyle } from './visualStyles/HandDrawnStyle';
import { MinimalStyle } from './visualStyles/MinimalStyle';
import { FlowchartStyle } from './visualStyles/FlowchartStyle';
import { MindMapStyle } from './visualStyles/MindMapStyle';
import { TimelineFlowStyle } from './visualStyles/TimelineFlowStyle';
import { ArchitectureStyle } from './visualStyles/ArchitectureStyle';
import { exportToImage, copyToClipboard, downloadJSON } from '../utils/exportImage';

interface VisualSummaryProps {
  summary: MeetingSummary;
  style: VisualStyle;
}

export function VisualSummary({ summary, style }: VisualSummaryProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToImage('visual-summary-content', `meeting-summary-${summary.title.slice(0, 20)}.png`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard('visual-summary-content');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy image. Please try downloading instead.');
    }
  };

  const handleDownloadJSON = () => {
    downloadJSON(summary, `meeting-data-${summary.title.slice(0, 20)}.json`);
  };

  const renderStyle = () => {
    switch (style) {
      case 'architecture':
        return <ArchitectureStyle summary={summary} />;
      case 'flowchart':
        return <FlowchartStyle summary={summary} />;
      case 'mindmap':
        return <MindMapStyle summary={summary} />;
      case 'timeline':
        return <TimelineFlowStyle summary={summary} />;
      case 'handdrawn':
        return <HandDrawnStyle summary={summary} />;
      case 'minimal':
        return <MinimalStyle summary={summary} />;
      case 'modern':
      default:
        return <ModernStyle summary={summary} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            Visual Summary
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Visual Content */}
      <div className="relative">
        <div 
          id="visual-summary-content"
          ref={contentRef}
          className="overflow-hidden"
          style={{ 
            maxHeight: 'none',
          }}
        >
          {renderStyle()}
        </div>
        
        {/* Export Overlay (shown during export) */}
        {isExporting && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Generating image...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
