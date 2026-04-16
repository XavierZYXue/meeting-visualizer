import type { MeetingSummary } from '../types';
import { MEETING_SUMMARY_PROMPT, simulateAISummary } from '../utils/promptTemplates';

export function setApiKey(key: string): void {
  localStorage.setItem('openai_api_key', key);
}

export function getApiKey(): string {
  return localStorage.getItem('openai_api_key') || '';
}

export async function generateMeetingSummary(transcript: string): Promise<MeetingSummary> {
  const apiKey = getApiKey();
  
  // If no API key, use simulation mode
  if (!apiKey) {
    console.log('No API key found, using simulation mode');
    return simulateAISummary(transcript);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional meeting assistant that creates structured summaries from transcripts.'
          },
          {
            role: 'user',
            content: MEETING_SUMMARY_PROMPT.replace('{transcript}', transcript)
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    const parsed = JSON.parse(jsonStr);
    
    // Ensure visualData exists
    if (!parsed.visualData) {
      parsed.visualData = generateVisualData(parsed);
    }
    
    return parsed as MeetingSummary;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    console.log('Falling back to simulation mode');
    return simulateAISummary(transcript);
  }
}

function generateVisualData(summary: Partial<MeetingSummary>) {
  return [
    {
      id: 'header',
      type: 'header' as const,
      title: summary.title || 'Meeting Summary',
      content: `Meeting Summary • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      icon: '📋',
      accent: '#6366f1'
    },
    {
      id: 'summary',
      type: 'summary' as const,
      title: 'Executive Summary',
      content: summary.summary || '',
      icon: '📝',
      accent: '#8b5cf6'
    },
    {
      id: 'decisions',
      type: 'decisions' as const,
      title: 'Key Decisions',
      content: summary.keyDecisions || [],
      icon: '✓',
      accent: '#10b981'
    },
    {
      id: 'actions',
      type: 'actions' as const,
      title: 'Action Items',
      items: summary.actionItems || [],
      icon: '⚡',
      accent: '#6366f1'
    },
    {
      id: 'timeline',
      type: 'timeline' as const,
      title: 'Project Timeline',
      phases: summary.timeline || [],
      icon: '📅',
      accent: '#f59e0b'
    }
  ];
}

// Alternative: Claude API support
export async function generateMeetingSummaryWithClaude(transcript: string, claudeApiKey: string): Promise<MeetingSummary> {
  if (!claudeApiKey) {
    return simulateAISummary(transcript);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: MEETING_SUMMARY_PROMPT.replace('{transcript}', transcript)
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.visualData) {
      parsed.visualData = generateVisualData(parsed);
    }
    
    return parsed as MeetingSummary;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return simulateAISummary(transcript);
  }
}
