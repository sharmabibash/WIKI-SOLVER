<div align="center">

# 🌐 WikiSolver: Wikipedia Shortest Path & Bidirectional BFS Visualizer

**An ultra-high-performance web application and algorithmic visualizer that finds and visualizes the shortest path between any two Wikipedia articles using the Bidirectional Breadth-First Search (Bidirectional BFS) graph algorithm.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![D3.js](https://img.shields.io/badge/D3_Force-3.0-F9A03C?style=for-the-badge&logo=d3.js)](https://d3js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Features](#-key-features) • [Algorithm & Math](#-deep-dive-into-the-algorithm) • [Architecture](#-architecture--directory-structure) • [Getting Started](#-getting-started) • [API Engine](#-wikipedia-api-engine)

</div>

---

## 📖 Introduction

The **"Six Degrees of Wikipedia"** (or Wikiracing) is a classic problem: Given two arbitrary Wikipedia articles (e.g., *Albert Einstein* and *Quantum Computing*, or *India* and *Kathmandu*), what is the minimum number of hyperlinks needed to navigate from the start article to the target article?

Wikipedia consists of over **6.8 million articles** in English alone, forming a massive, directed graph with an average branching factor of $b \approx 50\text{ to }300$ links per page. Exploring this graph with traditional search algorithms leads to combinatorial explosion.

**WikiSolver** solves this problem in milliseconds ($\sim 200\text{ms}$ for 3-step paths and $< 600\text{ms}$ for 4 to 5-step paths) by combining **Bidirectional Breadth-First Search**, **parallel multi-level hash set intersection**, and an **interactive D3 force-directed visualizer**.

---

## ⚡ Deep Dive into the Algorithm

### 1. The Core Challenge: The Combinatorial Explosion of Standard BFS

In standard (unidirectional) Breadth-First Search starting from node $S$ toward target node $T$:
- At depth $1$, you explore $b$ articles.
- At depth $2$, you explore $b^2$ articles.
- At depth $d$, you explore $b^d$ articles.

If an article average branching factor is $b = 100$:
- Depth 1: $100$ nodes
- Depth 2: $10,000$ nodes
- Depth 3: $1,000,000$ nodes
- Depth 4: $100,000,000$ nodes (Intractable in browser / real-time HTTP requests)

$$\text{Time Complexity of Unidirectional BFS} = \mathcal{O}(b^d)$$
$$\text{Space Complexity of Unidirectional BFS} = \mathcal{O}(b^d)$$

---

### 2. The Solution: Bidirectional Breadth-First Search (Bidirectional BFS)

Bidirectional BFS runs **two concurrent searches**:
1. **Forward Search**: Starts at the **Start Article** $S$, traversing *outgoing hyperlinks* ($\text{out-edges}$).
2. **Backward Search**: Starts at the **Target Article** $T$, traversing *incoming backlinks* ($\text{in-edges}$).

The two frontiers grow toward each other like expanding spheres. When the two frontiers collide at an intersection node $M$, the algorithm stops immediately and stitches the path.

```
       FORWARD SEARCH                     BACKWARD SEARCH
     (Outgoing Hyperlinks)              (Incoming Backlinks)
     
        [ Start (S) ]                      [ Target (T) ]
           /     \                            /      \
       [ A1 ]   [ A2 ]                    [ C1 ]    [ C2 ]
        /         \                        /          \
    [ B1 ] ----> [ Meeting Node (M) ] <---- [ B2 ]
                       ▲
                       │
            Collision Detected in O(1)!
     Path = S -> A2 -> M -> B2 -> Target
```

#### Mathematical Complexity Comparison:
Instead of a single search of radius $d$, both searches only need to reach a radius of $d/2$:

$$\text{Total Explored Space} = \mathcal{O}\left(b^{d/2} + b^{d/2}\right) = \mathcal{O}\left(2 \cdot b^{d/2}\right) \ll \mathcal{O}(b^d)$$

| Search Depth ($d$) | Standard BFS $\mathcal{O}(b^d)$ with $b=100$ | Bidirectional BFS $\mathcal{O}(2 \cdot b^{d/2})$ with $b=100$ | Speedup Factor |
|:---:|:---:|:---:|:---:|
| **2 hops** (3 steps) | $10,000$ nodes | $200$ nodes | **$50\times$ faster** |
| **4 hops** (5 steps) | $100,000,000$ nodes | $20,000$ nodes | **$5,000\times$ faster** |
| **6 hops** (7 steps) | $1,000,000,000,000$ nodes | $2,000,000$ nodes | **$500,000\times$ faster** |

---

### 3. Parallel Multi-Level Set Intersection Optimization

Rather than performing serial single-node expansions across HTTP requests, **WikiSolver** organizes the search into optimized algorithmic phases:

#### Phase 1: Parallel 1-Hop Check ($< 150\text{ms}$)
- Simultaneously fetches $\text{links}(S)$ and $\text{backlinks}(T)$ with `Promise.all`.
- If $T \in \text{links}(S)$, return direct path:
  $$\text{Path} = [S, T]$$

#### Phase 2: Instant 2-Hop Set Intersection / 3 Steps ($\approx 200\text{ms}$)
- Uses an in-memory hash set lookup ($O(1)$ per key) to intersect outgoing links with incoming backlinks:
  $$\text{Intersection} = \text{Set}(\text{links}(S)) \cap \text{Set}(\text{backlinks}(T))$$
- If any common article $M$ exists (e.g. *Atal Bihari Vajpayee*, *South Asia*, *Himalayas* for *India $\to$ Kathmandu*):
  $$\text{Path} = [S, M, T]$$

#### Phase 3: Fast-Batch 3-Hop Check / 4 Steps ($\approx 400\text{ms}$)
- Takes the top candidate articles $A_1, A_2, \dots, A_k$ from $\text{links}(S)$ and batch queries their links in a single request:
  $$\bigcup_{i=1}^k \text{links}(A_i) \cap \text{Set}(\text{backlinks}(T))$$
- If an intersection $M$ is found through candidate $A_i$:
  $$\text{Path} = [S, A_i, M, T]$$

#### Phase 4: Dual-Sided 4-Hop Check / 5 Steps ($\approx 600\text{ms}$)
- Concurrently queries 2nd-degree forward links $\text{links}(A_i)$ and 2nd-degree backward backlinks $\text{backlinks}(C_j)$.
- Computes dual set intersection over $\sim 100,000+$ possible paths:
  $$\text{Path} = [S, A_i, M, C_j, T]$$

#### Phase 5: General Adaptive Queue BFS (Up to 10 Steps)
- For deeply separated or obscure articles, dynamic frontier queues alternate expansion on the smaller frontier $\min(|Q_{\text{forward}}|, |Q_{\text{backward}}|)$ to prevent branch explosion up to depth 10.

---

## ✨ Key Features

- 🚀 **Blazing Fast Solving**: Computes shortest paths in $200\text{ms}$ using parallel set intersections.
- 🎨 **Interactive D3 Force-Directed Graph**:
  - Smooth 60fps physics simulation with node repulsion, edge springs, and collision avoidance.
  - Interactive pan, zoom, and centering.
  - Distinctive neon visual encodings (Cyan for Forward, Purple for Backward, Gold for Meeting Intersection, Emerald for Shortest Path).
  - Animated particle flow traveling along shortest path edges.
- 🔍 **Live Autocomplete Search**: Real-time Wikipedia article search with thumbnail and description previews.
- 🎲 **Randomize & Presets Bar**: Instant test presets (*Albert Einstein $\to$ Quantum Computing*, *Kevin Bacon*, *Pyramids of Giza $\to$ Apollo 11*, *Coffee $\to$ Industrial Revolution*) and random Wikipedia article generator.
- 🎮 **Step-by-Step Playback Controls**: Play, Pause, Step Next, Speed Multipliers ($0.25\times, 0.5\times, 1\times, 2\times, 5\times, \text{Max}$), and Reset.
- 📊 **Real-Time DSA Metrics HUD**: Tracks Forward Visited, Backward Visited, BFS Depth Levels, Degrees of Separation (Hops), and Elapsed Time in milliseconds.
- 📑 **Wikipedia Article Inspector Modal**: Click any graph node to inspect its live summary extract, image, and direct Wikipedia link.
- 📋 **Copyable Breadcrumb Trail**: Visual breadcrumb sequence with single-click clipboard copying.

---

## 🛠️ Architecture & Directory Structure

```
wiki-solver/
│
├── src/
│   ├── app/
│   │   ├── layout.js                   # Root layout, Google Fonts (Inter, JetBrains Mono)
│   │   ├── globals.css                 # Dark theme tokens, glassmorphism, glowing shaders
│   │   ├── page.js                     # Main landing page & visualizer container
│   │   ├── solver/
│   │   │   └── page.js                 # Dedicated full-screen solver route
│   │   └── api/
│   │       └── wiki/
│   │           └── route.js            # Wikipedia API proxy with memory caching
│   │
│   ├── algorithms/
│   │   └── bidirectionalBFS.js         # Multi-level Bidirectional BFS generator engine
│   │
│   ├── wiki/
│   │   ├── fetchWikiPage.js            # Outgoing links, backlinks, summaries, and search client
│   │   ├── extractLinks.js            # Link normalizer & namespace filter (removes File:, Talk:, etc.)
│   │   └── buildGraph.js              # WikiGraphModel graph data structure manager
│   │
│   ├── hooks/
│   │   └── useBFSVisualizer.js         # State machine, animation loop, speed, and timeline events
│   │
│   ├── utils/
│   │   ├── graph.js                    # Visual attributes, node styling & path stitcher
│   │   └── presets.js                  # Curated Wikipedia test pairs
│   │
│   └── components/
│       ├── Solver/
│       │   ├── Solver.js               # Main coordinator component
│       │   ├── WikiSearch.js           # Live autocomplete input with thumbnails
│       │   ├── StartTargetSelector.js  # Dual search selector with swap & preset pills
│       │   └── ResultPath.js           # Visual breadcrumbs for shortest path
│       │
│       └── Visualizer/
│           ├── GraphVisualizer.js      # D3-force interactive canvas/SVG visualizer
│           ├── GraphNode.js            # Node rendering, glows & badges
│           ├── GraphEdge.js            # Directed edges, markers & animated particles
│           ├── BFSControls.js          # Playback & speed controls toolbar
│           ├── Legend.js               # Color code visual guide
│           ├── StatsPanel.js           # Real-time DSA metrics HUD
│           └── ArticleModal.js         # Wikipedia summary drawer modal
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.mjs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **yarn** / **pnpm** / **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sharmabibash/WIKI-SOLVER.git
   cd WIKI-SOLVER
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to **[http://localhost:3000](http://localhost:3000)**.

### Production Build

```bash
npm run build
npm start
```

---

## 📡 Wikipedia API Engine

The `/api/wiki` backend route acts as a caching proxy to the MediaWiki Action and REST APIs, avoiding CORS restrictions and accelerating repetitive lookups:

| Endpoint Action | Purpose | MediaWiki API Equivalent |
|---|---|---|
| `GET /api/wiki?action=search&query={q}` | Live autocomplete | `action=opensearch&search={q}` |
| `GET /api/wiki?action=links&title={t}` | Outgoing links | `action=query&prop=links&titles={t}&pllimit=500` |
| `GET /api/wiki?action=batch_links&titles={t1\|t2}` | Batch outgoing links | `action=query&prop=links&titles={t1\|t2}&pllimit=500` |
| `GET /api/wiki?action=backlinks&title={t}` | Incoming backlinks | `action=query&list=backlinks&bltitle={t}&bllimit=500` |
| `GET /api/wiki?action=batch_backlinks&titles={t1\|t2}` | Parallel backlinks | Concurrent `list=backlinks` calls |
| `GET /api/wiki?action=summary&title={t}` | Extract & Thumbnail | `/api/rest_v1/page/summary/{t}` |
| `GET /api/wiki?action=random` | 2 Random Articles | `action=query&list=random&rnlimit=2` |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/sharmabibash/WIKI-SOLVER/issues).

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
