'use client';

import React from 'react';

export default function GraphEdge({ edge }) {
  const sourceX = edge.source.x ?? 0;
  const sourceY = edge.source.y ?? 0;
  const targetX = edge.target.x ?? 0;
  const targetY = edge.target.y ?? 0;

  const isShortestPath = edge.isShortestPath;
  const isBackward = edge.direction === 'backward';

  const strokeColor = isShortestPath
    ? '#10b981'
    : isBackward
    ? 'rgba(192, 132, 252, 0.4)'
    : 'rgba(56, 189, 248, 0.4)';

  const strokeWidth = isShortestPath ? 3.5 : 1.2;

  return (
    <g className="transition-all duration-300">
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isShortestPath ? 'none' : isBackward ? '4,4' : 'none'}
        markerEnd={isShortestPath ? 'url(#arrow-path)' : isBackward ? 'url(#arrow-backward)' : 'url(#arrow-forward)'}
      />

      {/* Animated particle pulse along shortest path */}
      {isShortestPath && (
        <circle r="4" fill="#34d399" className="opacity-90">
          <animateMotion
            path={`M${sourceX},${sourceY} L${targetX},${targetY}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}
