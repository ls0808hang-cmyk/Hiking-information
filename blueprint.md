# Blueprint: Hiking Information Guide (전국 등산로 난이도 안내 가이드)

## Project Overview
A modern, accessible web application providing information on hiking trails and difficulty levels in South Korea. The goal is to provide hikers with essential tips and a checklist for a safe mountain experience.

## Technical Stack
- **HTML5**: Semantic markup for accessibility.
- **CSS3 (Baseline)**: Modern features like OKLCH color space, CSS variables, logical properties, and Grid/Flexbox layouts.
- **JavaScript (ES Modules)**: Web Components for encapsulated UI logic and modern syntax for responsiveness.
- **No Frameworks**: Pure Web Standards (Vanilla JS/CSS).
- **External API**: Gemini 1.5 Flash (v1 API) for stable real-time mountain information and generation.

## Core Features & Components
1.  **Modern Search Interface**: A clean, interactive search section for finding mountain trails using live API data.
2.  **Web Component: `<difficulty-card>`**: A reusable component to display hiking difficulty levels (Easy, Moderate, Advanced) with color coding and tips.
3.  **Detailed Beginner's Guide**: Comprehensive advice on planning (weather, sunset), layering system (clothing table), walking techniques (knee protection), and LNT ethics.
4.  **Checklist Section**: A visually engaging list of essential items and pre-hike checks.
5.  **Responsive Design**: Mobile-first approach ensuring a great experience on all devices.
6.  **Premium Aesthetic**: Subtle textures, deep multi-layered shadows, and vibrant typography.

## Design Details
- **Color Palette**: OKLCH-based colors for consistent vibrance across displays.
  - Primary Green: `oklch(0.7 0.2 145)`
  - Warning/Hard: `oklch(0.6 0.18 20)`
  - Background Texture: Subtle noise pattern.
- **Typography**: Apple SD Gothic Neo with fallbacks, prioritizing readability.
- **Shadows**: Multi-layered "lifted" effect for cards.

## Current Plan: Modernization & Redesign
1.  **Extract styling and logic**: Move all inline assets to their respective files. (Done)
2.  **Implement Web Components**: Define `<difficulty-card>` in `main.js`. (Done)
3.  **Apply Modern Styles**: Use `style.css` to build the premium UI. (Done)
4. **Real-time API Integration**: Implemented Cloudflare Pages serverless function (`/functions/api/search.js`) powered by stable Gemini 1.5 Flash (v1) to generate and provide detailed mountain information. (Done)

5.  **Site Verification**: Add Google Search Console verification meta tag. (Done)
6.  **Verify & Refine**: Ensure accessibility and responsiveness. (In Progress)
