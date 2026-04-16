import { useState, useEffect } from 'react';
import { Sparkles, Settings, X, Wand2 } from 'lucide-react';
import { RecordingPanel } from './components/RecordingPanel';
import { VisualSummary } from './components/VisualSummary';
import { generateMeetingSummary } from './services/openai';
import { getApiKey, setApiKey } from './services/openai';
import type { MeetingSummary, VisualStyle } from './types';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<VisualStyle>('architecture');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    setHasApiKey(!!key);
    setApiKeyInput(key);
  }, []);

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      alert('Please record or enter some meeting content first.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMeetingSummary(transcript);
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    setHasApiKey(!!apiKeyInput);
    setShowSettings(false);
  };

  const handleClear = () => {
    setTranscript('');
    setSummary(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meeting Visualizer</h1>
                <p className="text-xs text-gray-500">Record • Summarize • Visualize</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Recording */}
          <div className="space-y-6">
            <RecordingPanel onTranscriptChange={handleTranscriptChange} />
            
            {/* Generate Button */}
            {transcript.length > 50 && !summary && (
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Visual Summary
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Demo Hint */}
            {!hasApiKey && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Demo Mode:</strong> Running without AI API key. Using local simulation for summaries. 
                  Add your OpenAI API key in settings for better results.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Visual Output */}
          <div className="space-y-6">
            {summary ? (
              <>
                <VisualSummary summary={summary} style={style} onStyleChange={setStyle} />
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleClear}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Start New Meeting
                  </button>
                </div>
              </>
            ) : (
              <div className="visual-card p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your visual summary will appear here
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Record a meeting or paste your transcript, then click "Generate Visual Summary" to create a beautiful visual representation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your API key is stored locally in your browser. Never shared with anyone.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About AI Processing</h3>
                <p className="text-sm text-gray-600">
                  This app uses GPT-4o-mini for meeting summarization. Without an API key, 
                  it falls back to local simulation mode with basic parsing.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
