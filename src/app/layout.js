import './globals.css';

export const metadata = {
  title: 'WikiSolver - Wikipedia Shortest Path & Bidirectional BFS Visualizer',
  description: 'Find the shortest path between any two Wikipedia articles using the double-sided (bidirectional) BFS algorithm with real-time graph visualization.',
  keywords: ['Wikipedia Game', 'Six Degrees of Wikipedia', 'Bidirectional BFS', 'DSA Visualizer', 'Graph Algorithm', 'Breadth First Search'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
