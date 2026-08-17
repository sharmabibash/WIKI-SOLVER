'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3-force';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import { getNodeVisualAttributes } from '../../utils/graph';

export default function GraphVisualizer({
  graphData,
  startNode,
  targetNode,
  intersectionNode,
  shortestPath,
  onSelectNode,
  activeNode
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const pathSet = useRef(new Set());
  pathSet.current = new Set(shortestPath || []);

  // Update simulation when graphData changes
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // Create or update simulation
    const currentNodes = graphData.nodes.map(d => {
      const existing = nodes.find(n => n.id === d.id);
      return {
        ...d,
        x: existing?.x ?? (d.direction === 'forward' ? width * 0.35 + (Math.random() - 0.5) * 50 : width * 0.65 + (Math.random() - 0.5) * 50),
        y: existing?.y ?? height * 0.5 + (Math.random() - 0.5) * 60,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0
      };
    });

    // Fix Start and Target positions slightly for intuitive left-to-right bidirectional visualization
    currentNodes.forEach(node => {
      if (node.id === startNode) {
        node.fx = width * 0.2;
        node.fy = height * 0.5;
      } else if (node.id === targetNode) {
        node.fx = width * 0.8;
        node.fy = height * 0.5;
      }
    });

    const currentLinks = graphData.links.map(l => ({
      ...l,
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target
    }));

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const sim = d3.forceSimulation(currentNodes)
      .force(
        'link',
        d3.forceLink(currentLinks)
          .id(d => d.id)
          .distance(d => (d.isShortestPath ? 70 : 85))
          .strength(d => (d.isShortestPath ? 0.9 : 0.6))
      )
      .force('charge', d3.forceManyBody().strength(-140).distanceMax(350))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force('collide', d3.forceCollide().radius(d => (d.id === startNode || d.id === targetNode ? 32 : 22)))
      .alphaDecay(0.028)
      .on('tick', () => {
        setNodes([...currentNodes]);
        setLinks([...currentLinks]);
      });

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [graphData, startNode, targetNode]);

  // Mouse pan handling
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom with wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newK = Math.min(Math.max(0.3, transform.k * zoomFactor), 3.5);
    
    // Zoom around center
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => ({
      k: newK,
      x: mouseX - (mouseX - prev.x) * (newK / prev.k),
      y: mouseY - (mouseY - prev.y) * (newK / prev.k)
    }));
  };

  const handleZoom = useCallback((direction) => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    setTransform(prev => {
      const newK = Math.min(Math.max(0.3, prev.k * factor), 3.5);
      return { ...prev, k: newK };
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  // Expose zoom methods via DOM or parent handlers if needed
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [transform]);

  const handleNodeHover = (node, e) => {
    if (!node) {
      setHoveredNode(null);
      return;
    }
    setHoveredNode(node);
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 10
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-[520px] md:h-[620px] bg-[#070b12] rounded-2xl border border-slate-800/90 overflow-hidden select-none cursor-grab active:cursor-grabbing bg-grid-pattern shadow-2xl`}
    >
      {/* Ambient background glows for start/target hubs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrow-forward"
            viewBox="0 -5 10 10"
            refX="16"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#38bdf8" />
          </marker>

          <marker
            id="arrow-backward"
            viewBox="0 -5 10 10"
            refX="16"
            refY="0"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#c084fc" />
          </marker>

          <marker
            id="arrow-path"
            viewBox="0 -5 10 10"
            refX="18"
            refY="0"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#10b981" />
          </marker>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Edges layer */}
          <g className="edges">
            {links.map((link, idx) => (
              <GraphEdge
                key={link.id || `${typeof link.source === 'object' ? link.source.id : link.source}->${typeof link.target === 'object' ? link.target.id : link.target}-${idx}`}
                edge={link}
              />
            ))}
          </g>

          {/* Nodes layer */}
          <g className="nodes">
            {nodes.map((node) => {
              const isStart = node.id === startNode;
              const isTarget = node.id === targetNode;
              const isCollision = node.id === intersectionNode;
              const isPathNode = pathSet.current.has(node.id);

              return (
                <GraphNode
                  key={node.id}
                  node={node}
                  isStart={isStart}
                  isTarget={isTarget}
                  isCollision={isCollision}
                  isPathNode={isPathNode}
                  onClick={(n) => onSelectNode?.(n.id, n)}
                  onHover={handleNodeHover}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* Empty State Instructions */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-xl mb-4 text-cyan-400">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" strokeDasharray="3 3" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-200">
            Wikipedia Graph Visualizer
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1.5 leading-relaxed">
            Select a Start and Target Wikipedia page above, then press{' '}
            <span className="text-cyan-400 font-semibold">Find Shortest Path</span> to watch the forward & backward BFS exploration meet!
          </p>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          className="absolute z-40 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-bold text-white text-sm truncate">
            {hoveredNode.id}
          </div>
          <div className="mt-1 flex items-center gap-2 text-slate-400">
            <span className="capitalize">{hoveredNode.direction || 'Neutral'} Search</span>
            <span>•</span>
            <span>Level {hoveredNode.level ?? 0}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-cyan-400 flex items-center gap-1 font-semibold">
            <span>Click node to view Wikipedia preview</span>
          </div>
        </div>
      )}

      {/* Floating Canvas Quick Info */}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 backdrop-blur-md flex items-center gap-3">
        <span>Nodes: <strong className="text-slate-200">{nodes.length}</strong></span>
        <span>Edges: <strong className="text-slate-200">{links.length}</strong></span>
        <span>Zoom: <strong className="text-slate-200">{(transform.k * 100).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
}
