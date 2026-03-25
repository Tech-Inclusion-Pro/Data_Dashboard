<p align="center">
  <img src="public/logo.png" alt="Data Dashboard Logo" width="180" />
</p>

<h1 align="center">Data Dashboard</h1>

<p align="center">
  AI-powered, local-first data analytics dashboard built with React, Zustand, and Ollama.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-purple" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-cyan" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Ollama-Local_AI-green" alt="Ollama" />
  <img src="https://img.shields.io/badge/WCAG-Accessible-orange" alt="WCAG Accessible" />
</p>

---

## Overview

**Data Dashboard** is a privacy-preserving analytics application that runs entirely on your machine. Upload CSV, XLSX, JSON, or TXT files and get AI-generated insights, risk flags, metrics, and trend visualizations — all powered by [Ollama](https://ollama.com) running locally. No data ever leaves your computer.

---

## Features

### Core Dashboard
- **Drag-and-drop file upload** — CSV, XLSX, JSON, TXT support with instant parsing
- **AI-powered insights** — automatic metrics, risk flags, and trend analysis
- **Draggable widget layout** — reorder and customize your dashboard
- **Pinned insights** — save important findings for quick access
- **Projects overview** — see all projects with block, task, and file counts at a glance

### Project Workspaces
- **Block-based workspace** — organize analysis with modular content blocks:
  - **General Analysis** — AI-generated data summary
  - **Risk Summary** — AI-identified risk flags
  - **Recommendations** — AI action items
  - **Graphs** — AI-configured charts (bar, line, pie, area)
  - **Notes** — free-text editable notes
  - **Tasks** — track tasks with priority, status, and due dates
  - **Previous Chats** — saved chat conversations with load/remove
  - **Project Insights** — AI cross-block analysis with optional focus area
- **Per-project file uploads** — isolated file storage per project
- **Drag-and-drop block reordering**
- **Export reports** — Markdown, plain text, or Word (.docx) with proper bold/italic formatting

### AI Chat
- **Streaming chat** with Ollama integration
- **Suggested prompt chips** for quick questions
- **Save chats** globally or to specific projects
- **Load previous chats** back into the chat panel from project blocks
- **Stop generation** mid-stream

### Settings & Configuration
- **System prompt editor** — customize AI behavior
- **Model selector** — choose from any Ollama model
- **API Manager** — configure external API endpoints
- **Ollama health monitoring** — live connection status indicator

### Accessibility (WCAG)
- Skip-to-content link
- Full keyboard navigation
- Focus trapping in modals
- ARIA labels, roles, and live regions
- Screen reader compatible

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Ollama** installed and running locally ([download here](https://ollama.com/download))
- At least one Ollama model pulled (e.g., `ollama pull gemma3:4b`)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tech-Inclusion-Pro/Data_Dashboard.git
cd Data_Dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Ollama

Make sure Ollama is running in the background:

```bash
ollama serve
```

Pull a model if you haven't already:

```bash
ollama pull gemma3:4b
```

### 4. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the next available port).

---

## Usage

### Upload Data

1. **Drag and drop** files onto the upload zone on the Dashboard, or click to browse
2. Supported formats: `.csv`, `.xlsx`, `.xls`, `.json`, `.txt`
3. Click **"Generate Insights"** to run AI analysis on your data

### Create a Project

1. Navigate to **Projects** in the sidebar
2. Click **"New Project"** and give it a name
3. Add blocks using the **"+"** buttons in the workspace grid
4. Upload project-specific files with the **"Upload File"** button

### Available Block Types

| Block | Description |
|-------|-------------|
| General Analysis | AI-generated summary of key patterns and trends |
| Graphs | AI-configured chart visualizations |
| Previous Chats | Saved chat conversations — click "Load in Chat" to reopen |
| Notes | Free-text notes with timestamps |
| Risk Summary | AI-identified risk flags with severity ratings |
| Recommendations | AI-generated action items |
| Tasks | Task tracker with priority, status, and due dates |
| Project Insights | Cross-block AI analysis — gathers all block content for comprehensive review |

### Export Reports

1. Open a project workspace
2. Click **"Export Report"**
3. Select which blocks to include
4. Choose format: **Markdown**, **Text**, or **Word (.docx)**
5. Bold (`**text**`) and italic (`*text*`) formatting is preserved in Word exports

### Chat with AI

1. Click **"Open Chat"** in the top bar
2. Type a question or click a suggested prompt chip
3. Save conversations globally or to a specific project
4. Load saved chats back from Previous Chats blocks

---

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory. Serve it with any static file server:

```bash
npm run preview
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev) | UI framework |
| [Vite 8](https://vite.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [Zustand](https://zustand.docs.pmnd.rs) | State management with localStorage persistence |
| [Ollama](https://ollama.com) | Local AI model inference |
| [docx](https://docx.js.org) | Word document generation |
| [PapaParse](https://www.papaparse.com) | CSV parsing |
| [SheetJS (xlsx)](https://sheetjs.com) | Excel file parsing |
| [Recharts](https://recharts.org) | Chart visualizations |

---

## Project Structure

```
src/
  App.jsx                          # Main application shell
  components/
    api-manager/                   # API endpoint management
    chat/                          # AI chat panel, input, messages
    dashboard/                     # Dashboard widgets and overview
    layout/                        # Sidebar, TopBar, PanelLayout
    projects/                      # Project workspace and blocks
    settings/                      # Settings and system prompt
    shared/                        # Reusable components (FocusTrap, etc.)
  hooks/
    useOllama.js                   # Ollama API integration
    useInsightEngine.js            # AI-powered data analysis
    useAPIFetch.js                 # External API fetching
  store/
    chatStore.js                   # Chat messages and state
    projectStore.js                # Projects, blocks, files
    insightStore.js                # AI-generated insights
    layoutStore.js                 # Dashboard widget order
    settingsStore.js               # App configuration
    apiStore.js                    # External API configs
  utils/
    exportUtils.js                 # Text, Markdown, DOCX export
    fileParsers.js                 # CSV, XLSX, JSON, TXT parsing
```

---

## Configuration

### Ollama URL

By default the app connects to Ollama at `/ollama` (proxied by Vite in development). You can change this in **Settings > Ollama URL**.

### Vite Proxy

The development server proxies `/ollama` to `http://localhost:11434`. See `vite.config.js`:

```js
server: {
  proxy: {
    '/ollama': {
      target: 'http://localhost:11434',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/ollama/, ''),
    },
  },
}
```

---

## License

This project is licensed under the terms included in the [LICENSE](LICENSE) file.

---

<p align="center">
  Built with care by <a href="https://github.com/Tech-Inclusion-Pro">Tech Inclusion Pro</a>
</p>
