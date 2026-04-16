export interface MeetingSummary {
  title: string;
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  timeline?: TimelinePhase[];
  visualData: VisualCard[];
}

export interface ActionItem {
  task: string;
  owner: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TimelinePhase {
  name: string;
  duration: string;
  owner: string;
  description?: string;
}

export interface VisualCard {
  id: string;
  type: 'header' | 'summary' | 'decisions' | 'actions' | 'timeline' | 'notes';
  title?: string;
  content?: string | string[];
  items?: ActionItem[];
  phases?: TimelinePhase[];
  icon?: string;
  accent?: string;
}

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export type VisualStyle = 'modern' | 'handdrawn' | 'minimal' | 'flowchart' | 'mindmap' | 'timeline' | 'architecture';
