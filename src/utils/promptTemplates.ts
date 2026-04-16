import type { MeetingSummary } from '../types';

export const MEETING_SUMMARY_PROMPT = `You are a professional meeting assistant. Analyze the following meeting transcript and create a structured summary.

TRANSCRIPT:
---
{transcript}
---

Please analyze this meeting and provide the output in the following JSON format:

{
  "title": "A concise, descriptive title for the meeting (max 10 words)",
  "summary": "A brief executive summary of the meeting in 2-3 sentences highlighting the main purpose and outcome",
  "keyDecisions": [
    "List each major decision made during the meeting",
    "Include 2-5 key decisions"
  ],
  "actionItems": [
    {
      "task": "Clear description of what needs to be done",
      "owner": "Person responsible (use 'TBD' if not specified)",
      "deadline": "Due date or timeframe if mentioned, otherwise 'Not specified'",
      "priority": "high|medium|low based on urgency mentioned"
    }
  ],
  "timeline": [
    {
      "name": "Phase or milestone name",
      "duration": "Timeframe or duration",
      "owner": "Responsible person or team",
      "description": "Brief description of this phase"
    }
  ],
  "visualData": [
    {
      "id": "header",
      "type": "header",
      "title": "Meeting Title",
      "content": "Date and participants info"
    },
    {
      "id": "summary",
      "type": "summary",
      "title": "Executive Summary",
      "content": "Summary text here"
    },
    {
      "id": "decisions",
      "type": "decisions",
      "title": "Key Decisions",
      "content": ["Array of decisions"],
      "accent": "#10b981"
    },
    {
      "id": "actions",
      "type": "actions",
      "title": "Action Items",
      "items": [{"task": "...", "owner": "...", "deadline": "...", "priority": "..."}],
      "accent": "#6366f1"
    },
    {
      "id": "timeline",
      "type": "timeline",
      "title": "Project Timeline",
      "phases": [{"name": "...", "duration": "...", "owner": "..."}],
      "accent": "#f59e0b"
    }
  ]
}

Guidelines:
1. If the transcript is unclear or too short, make reasonable inferences
2. Use professional but clear language
3. Focus on actionable outcomes
4. If no timeline is mentioned, create an empty timeline array
5. If no action items are mentioned, create an empty actionItems array
6. Ensure all JSON is properly formatted and valid
7. Use only the information present in the transcript - don't invent facts
8. Priority levels should be based on: high (urgent/this week), medium (soon/next few weeks), low (whenever/no deadline)

Respond ONLY with the JSON object, no markdown formatting or additional text.`;

// Simulated AI service for demo purposes
export function simulateAISummary(transcript: string): MeetingSummary {
  const lines = transcript.split(/[.!?]+/).filter(line => line.trim().length > 10);
  
  // Extract potential names (capitalized words)
  const nameMatches = transcript.match(/\b[A-Z][a-z]+\b/g) || [];
  const potentialNames = [...new Set(nameMatches)].slice(0, 3);
  
  // Extract potential dates/deadlines
  const dateMatches = transcript.match(/\b(tomorrow|next week|Monday|Tuesday|Wednesday|Thursday|Friday|by \w+|this \w+)\b/gi) || [];
  
  // Generate action items from sentences containing action words
  const actionWords = ['need', 'should', 'will', 'must', 'going to', 'plan to', 'prepare'];
  const actionSentences = lines.filter(line => 
    actionWords.some(word => line.toLowerCase().includes(word))
  );

  const actionItems = actionSentences.slice(0, 4).map((sentence, i) => ({
    task: sentence.trim().replace(/^\s*[a-z]\s*/, ''),
    owner: potentialNames[i % potentialNames.length] || 'TBD',
    deadline: dateMatches[i] || 'Not specified',
    priority: (['high', 'medium', 'low'] as const)[i % 3]
  }));

  // Generate decisions from sentences with decision words
  const decisionWords = ['decided', 'agreed', 'concluded', 'approved', 'chose', 'selected'];
  const decisions = lines
    .filter(line => decisionWords.some(word => line.toLowerCase().includes(word)))
    .map(line => line.trim())
    .slice(0, 4);

  // If no decisions found, create some generic ones
  const fallbackDecisions = [
    'Continue with current project timeline',
    'Schedule follow-up meeting next week',
    'Review progress at next team standup'
  ];

  const title = lines[0]?.slice(0, 50) || 'Meeting Summary';
  
  return {
    title: title.length > 40 ? title.slice(0, 40) + '...' : title,
    summary: lines.slice(0, 2).join('. ') + '.',
    keyDecisions: decisions.length > 0 ? decisions : fallbackDecisions,
    actionItems: actionItems.length > 0 ? actionItems : [
      { task: 'Review meeting notes', owner: 'Team', deadline: 'Next meeting', priority: 'medium' }
    ],
    timeline: [
      { name: 'Phase 1: Planning', duration: '1 week', owner: potentialNames[0] || 'Team Lead', description: 'Define scope and requirements' },
      { name: 'Phase 2: Execution', duration: '2-3 weeks', owner: potentialNames[1] || 'Team', description: 'Implementation and development' },
      { name: 'Phase 3: Review', duration: '3 days', owner: potentialNames[2] || 'Manager', description: 'Review and finalize deliverables' }
    ],
    visualData: [
      {
        id: 'header',
        type: 'header',
        title: title.length > 40 ? title.slice(0, 40) + '...' : title,
        content: `Meeting Summary • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        icon: '📋',
        accent: '#6366f1'
      },
      {
        id: 'summary',
        type: 'summary',
        title: 'Executive Summary',
        content: lines.slice(0, 2).join('. ') + '.',
        icon: '📝',
        accent: '#8b5cf6'
      },
      {
        id: 'decisions',
        type: 'decisions',
        title: 'Key Decisions',
        content: decisions.length > 0 ? decisions : fallbackDecisions,
        icon: '✓',
        accent: '#10b981'
      },
      {
        id: 'actions',
        type: 'actions',
        title: 'Action Items',
        items: actionItems.length > 0 ? actionItems : [
          { task: 'Review meeting notes', owner: 'Team', deadline: 'Next meeting', priority: 'medium' }
        ],
        icon: '⚡',
        accent: '#6366f1'
      },
      {
        id: 'timeline',
        type: 'timeline',
        title: 'Project Timeline',
        phases: [
          { name: 'Phase 1: Planning', duration: '1 week', owner: potentialNames[0] || 'Team Lead', description: 'Define scope and requirements' },
          { name: 'Phase 2: Execution', duration: '2-3 weeks', owner: potentialNames[1] || 'Team', description: 'Implementation and development' },
          { name: 'Phase 3: Review', duration: '3 days', owner: potentialNames[2] || 'Manager', description: 'Review and finalize deliverables' }
        ],
        icon: '📅',
        accent: '#f59e0b'
      }
    ],
    transcript // Keep original transcript for architecture parsing
  };
}
