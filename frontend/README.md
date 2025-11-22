# Neural AI Visualizer - Frontend

A stunning 3D neural network visualization interface built with React, Three.js, and Tailwind CSS.

## ✨ Features

- **3D Neural Network Visualization**: Interactive globe with nodes representing AI thinking process
- **Real-time Animations**: Smooth transitions and particle effects
- **Glassmorphism UI**: Modern frosted glass design with neon accents
- **Responsive Layout**: Collapsible sidebar, chat interface, and answer panel
- **High Contrast Theme**: Optimized for visibility with neon cyan/purple color scheme
- **Beautiful Typography**: Using Inter and Sora fonts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser with WebGL support

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## 🎨 Design System

### Colors
- **Neon Cyan**: `#22d3ee` - Primary accent, active states
- **Neon Purple**: `#8b5cf6` - Secondary accent, thinking states
- **Neon Pink**: `#ec4899` - Tertiary accent
- **Neon Green**: `#10b981` - Success states
- **Dark Background**: `#0a0a0f` - Main background
- **Dark Surface**: `#141420` - Elevated surfaces
- **Dark Elevated**: `#1a1a2e` - Highest elevation

### Typography
- **Display Font**: Sora (headings, titles)
- **Body Font**: Inter (body text, UI elements)

### Animations
- **Fast**: 150ms (micro-interactions)
- **Normal**: 300ms (standard transitions)
- **Slow**: 600ms (complex animations)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Left navigation sidebar
│   │   ├── ChatInput.jsx       # Bottom message input
│   │   ├── Globe.jsx           # 3D visualization canvas
│   │   └── AnswerPanel.jsx     # Right answer display panel
│   ├── hooks/
│   │   └── useChat.js          # Chat state management
│   ├── utils/
│   │   └── constants.js        # Colors, animations, node types
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles & Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎮 Usage

### Asking Questions
1. Type your question in the bottom input bar
2. Press Enter or click the send button
3. Watch the 3D visualization as nodes appear representing:
   - **Answer Core** (cyan) - Central node
   - **Generating nodes** (purple) - Active thinking
   - **Source nodes** (green) - Reference materials

### Interacting with the Globe
- **Click & Drag**: Rotate the view
- **Scroll**: Zoom in/out
- **Click Nodes**: View node details
- **Hover**: See glow effects

### Viewing Answers
- Answers automatically appear in the right panel
- Click sources to view references
- Copy or share responses using bottom buttons

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎯 Component Overview

### Globe Component
The main 3D visualization using React Three Fiber:
- Dynamic node generation
- Particle background effects
- Connection lines between nodes
- Auto-rotation and hover effects
- High contrast materials with emissive glow

### Sidebar Component
Collapsible conversation history:
- Glassmorphism design
- Recent conversations list
- New conversation button
- Timestamp formatting

### ChatInput Component
Smart message input:
- Auto-resizing textarea
- Send button with loading state
- Keyboard shortcuts
- Glassmorphism styling

### AnswerPanel Component
Slide-in answer display:
- Markdown-style formatting
- Source attribution
- Metadata display
- Action buttons

## 🌐 Backend Integration

The frontend expects a backend API at `http://localhost:8000/api`. Update `vite.config.js` to change the proxy target.

## 📝 Customization

### Changing Colors
Edit `tailwind.config.js` and `src/utils/constants.js` to modify the color scheme.

### Adjusting Animations
Modify animation durations in `tailwind.config.js` and `src/utils/constants.js`.

### Globe Settings
Customize node sizes, colors, and behaviors in `src/components/Globe.jsx`.

## 🐛 Troubleshooting

### Black screen or no 3D visualization
- Check browser console for WebGL errors
- Ensure your GPU drivers are up to date
- Try a different browser (Chrome/Firefox recommended)

### Blurry or low-quality rendering
- Check your browser zoom level (should be 100%)
- Ensure hardware acceleration is enabled
- Try reducing particle count in Globe.jsx

### Performance issues
- Reduce particle count (500 → 200 in Globe.jsx)
- Disable auto-rotation
- Close other browser tabs

## 📄 License

MIT License - Feel free to use this project for your own purposes.

## 🙏 Credits

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
