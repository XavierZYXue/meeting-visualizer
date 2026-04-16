# Meeting Visualizer

A real-time meeting recording and visualization application that transforms voice or text into beautiful architectural diagrams, flowcharts, mind maps, and more.

![Meeting Visualizer Demo](https://via.placeholder.com/800x400?text=Meeting+Visualizer+Demo)

## Features

### 🎙️ Real-time Speech Recognition
- **Browser-native Web Speech API** for instant voice-to-text conversion
- **English language support** (en-US) optimized for professional meetings
- **Continuous recording** with live transcript display
- **Manual editing** capability for transcript refinement

### 🤖 AI-Powered Summarization
- **Automatic meeting summarization** extracting key decisions and action items
- **OpenAI GPT-4o-mini integration** for high-quality summaries
- **Fallback simulation mode** works without API key
- **Structured output** with title, summary, decisions, action items, and timeline

### 📊 Multiple Visualization Styles
Choose from 7 different visualization formats:

| Style | Description | Best For |
|-------|-------------|----------|
| **Architecture** | Layered system architecture diagram | Technical discussions, service dependencies |
| **Flowchart** | Process flow with standard symbols | Decision-making processes |
| **Mind Map** | Radial tree structure | Brainstorming sessions |
| **Timeline** | Vertical chronological flow | Project planning |
| **Modern Cards** | Gradient cards with shadows | Executive summaries |
| **Hand Drawn** | Sketch-like organic borders | Creative workshops |
| **Minimal** | Typography-focused clean design | Simple overviews |

### 🖼️ Export Options
- **PNG Export** - High-resolution images (2x scale)
- **Clipboard Copy** - Quick paste into documents
- **JSON Download** - Structured data for further processing

## Quick Start

### Prerequisites
- Modern browser (Chrome, Edge, or Safari recommended)
- Microphone access for recording
- OpenAI API key (optional, for enhanced AI summaries)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd meeting-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Start Recording**
   - Click the microphone button to begin recording
   - Speak naturally - your words will appear in the transcript area
   - Click again to stop recording

2. **Generate Visualization**
   - Click "Generate Visual Summary" button
   - The AI will analyze your transcript and create a structured summary

3. **Choose Visualization Style**
   - Select from the "Visual Style" options
   - **Architecture** is recommended for technical discussions

4. **Export**
   - Click "Export PNG" to download as image
   - Or "Copy" to paste directly into your documents

## Architecture Diagram

The application follows a clean component-based architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Recording  │  │    Visual    │  │    Style     │  │
│  │    Panel     │  │   Summary    │  │   Selector   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              useSpeechRecognition Hook            │  │
│  │         (Web Speech API Integration)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Meeting Summary Service              │  │
│  │     (OpenAI API / Simulation Fallback)           │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Visualization Layer                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Architecture│ │Flowchart │ │ Mind Map │ │ Timeline │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  Modern  │ │Hand Drawn│ │  Minimal │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### OpenAI API Key (Optional)

For enhanced AI summaries, add your OpenAI API key:

1. Click the **Settings** icon (gear) in the top right
2. Enter your API key: `sk-...`
3. Click "Save Settings"

The API key is stored locally in your browser and never sent to any server except OpenAI.

### Environment Variables

Create a `.env` file for production builds:

```env
# Optional: Pre-configure API key
VITE_OPENAI_API_KEY=your-api-key-here
```

## Browser Compatibility

| Browser | Speech Recognition | Notes |
|---------|-------------------|-------|
| Chrome | ✅ Full Support | Recommended |
| Edge | ✅ Full Support | Recommended |
| Safari | ✅ Supported | Requires HTTPS |
| Firefox | ⚠️ Limited | May require flags |

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Export**: html2canvas
- **AI**: OpenAI GPT-4o-mini API

## Project Structure

```
meeting-visualizer/
├── src/
│   ├── components/
│   │   ├── RecordingPanel.tsx      # Recording controls & transcript
│   │   ├── VisualSummary.tsx       # Visualization container
│   │   ├── StyleSelector.tsx       # Style selection UI
│   │   └── visualStyles/           # Visualization implementations
│   │       ├── ArchitectureStyle.tsx
│   │       ├── FlowchartStyle.tsx
│   │       ├── MindMapStyle.tsx
│   │       ├── TimelineFlowStyle.tsx
│   │       ├── ModernStyle.tsx
│   │       ├── HandDrawnStyle.tsx
│   │       └── MinimalStyle.tsx
│   ├── hooks/
│   │   └── useSpeechRecognition.ts # Web Speech API hook
│   ├── services/
│   │   └── openai.ts               # AI summarization service
│   ├── utils/
│   │   ├── promptTemplates.ts      # AI prompt templates
│   │   └── exportImage.ts          # Image export utilities
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── App.tsx                     # Main application component
│   └── main.tsx                    # Application entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## Example Use Cases

### Technical Architecture Discussion
**Input**: "We have three services: Service A handles authentication, Service B manages user data, and Service C processes payments. Service B depends on Service C for transaction validation. We also have a frontend React app that communicates with Service A."

**Output**: Architecture diagram showing:
- Frontend → Service A → Database
- Service B ↔ Service C (dependency)
- All services connected to shared database

### Decision-Making Flowchart
**Input**: "We need to decide on the database technology. Option A is PostgreSQL for relational data, Option B is MongoDB for flexibility. We also need to choose between cloud providers: AWS has better services, Azure has better enterprise support. The team decided to go with PostgreSQL on AWS."

**Output**: Interactive flowchart with:
- Decision diamonds for database and cloud choices
- Process boxes for evaluation criteria
- Branch paths showing Yes/No decisions
- End node with final decision

**Visual Elements**:
```
[Start]
   ↓
[Choose Database] ──→ [PostgreSQL] ──→ [Choose Cloud]
   ↓                       ↓              ↓
[MongoDB]              [AWS] ←────── [Azure]
   ↓                       ↓
  [X]                 [Final Decision]
```

### Project Planning Meeting
**Input**: "Phase 1 is planning for one week, Phase 2 is development for three weeks, and Phase 3 is testing for one week. John leads planning, Sarah handles development, and Mike manages testing."

**Output**: Timeline visualization with phases, durations, and owners.

### Decision-Making Session
**Input**: "We decided to migrate from MongoDB to PostgreSQL. We also agreed to adopt microservices architecture. The team chose AWS for cloud hosting."

**Output**: Flowchart with decision diamonds and process boxes.

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Visualization Styles

1. Create a new file in `src/components/visualStyles/`
2. Implement the component accepting `MeetingSummary` prop
3. Add the style to `VisualStyle` type in `src/types/index.ts`
4. Register in `StyleSelector.tsx` and `VisualSummary.tsx`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Improvement

- [ ] Multi-language support (Chinese, Spanish, etc.)
- [ ] Real-time collaboration features
- [ ] Integration with meeting platforms (Zoom, Teams)
- [ ] Custom visualization templates
- [ ] Export to PDF, SVG formats

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Web Speech API for browser-native speech recognition
- OpenAI for GPT-4o-mini summarization
- Tailwind CSS for rapid UI development
- Lucide for beautiful icons

---

**Made with ❤️ for better meetings**
