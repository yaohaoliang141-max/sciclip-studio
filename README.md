# SciClip Studio (科影工坊)

SciClip Studio is an intelligent AI-agent workspace designed to automate the retrieval of high-quality B-roll footage for science popularization videos. By analyzing text scripts, it automatically extracts visual keywords and fetches matching, royalty-free video materials.

## ✨ Core Features

* **AI Script Analysis:** Leverages Google Gemini API to parse video scripts, segment logic, and extract accurate visual search queries.
* **Automated B-Roll Search:** Integrates seamlessly with the Pexels API to source high-resolution, royalty-free video clips.
* **Visual Preview & Selection:** Provides a clean interface to preview multiple footage candidates per script segment, allowing for easy manual overrides.
* **Batch Download:** One-click functionality to download all selected video materials locally for immediate editing.

## 🛠 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Vanilla CSS (Dark theme with glassmorphism design)
* **AI Engine:** Google Gemini API
* **Video Source:** Pexels API

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/yaohaoliang141-max/sciclip-studio-.git](https://github.com/yaohaoliang141-max/sciclip-studio-.git)
cd sciclip-studio-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a .env.local file in the root directory and add your API keys. (Do not commit this file to version control).
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Pexels API Key
PEXELS_API_KEY=your_pexels_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open http://localhost:3000 with your browser to see the result.
