'use client';

import React from 'react';
import { getNodeVisualAttributes } from '../../utils/graph';

export default function GraphNode({
  node,
  isStart,
  isTarget,
  isCollision,
  isPathNode,
  onClick,
  onHover
}) {
  const visual = getNodeVisualAttributes(node, isPathNode, isStart, isTarget, isCollision);

  return (
    <g
      transform={`translate(${node.x || 0}, ${node.y || 0})`}
      className="cursor-pointer transition-transform duration-150 hover:scale-125"
      onClick={() => onClick?.(node)}
      onMouseEnter={(e) => onHover?.(node, e)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Outer Pulse glow if active/special */}
      {(isStart || isTarget || isCollision || isPathNode) && (
        <circle
          r={visual.radius + 6}
          fill="none"
          stroke={visual.fill}
          strokeWidth="2"
          className="animate-ping opacity-40"
        />
      )}

      {/* Main Node Circle */}
      <circle
        r={visual.radius}
        fill={visual.fill}
        stroke={visual.stroke}
        strokeWidth={isPathNode || isCollision || isStart || isTarget ? '3' : '1.5'}
        filter={visual.glow ? 'url(#glow)' : undefined}
      />

      {/* Node label */}
      <text
        dy={visual.radius + 12}
        textAnchor="middle"
        fill={visual.labelColor}
        fontSize={isStart || isTarget || isCollision || isPathNode ? '12' : '9'}
        fontWeight={isStart || isTarget || isCollision || isPathNode ? '700' : '500'}
        className="pointer-events-none select-none font-sans drop-shadow-md"
      >
        {node.id.length > 20 ? `${node.id.substring(0, 18)}...` : node.id}
      </text>

      {/* Badge if special */}
      {visual.badge && (
        <g transform={`translate(0, -${visual.radius + 8})`}>
          <rect
            x="-24"
            y="-7"
            width="48"
            height="14"
            rx="7"
            fill="#090d16"
            stroke={visual.stroke}
            strokeWidth="1"
          />
          <text
            y="3"
            textAnchor="middle"
            fill={visual.stroke}
            fontSize="7.5"
            fontWeight="800"
            className="select-none uppercase font-mono"
          >
            {visual.badge}
          </text>
        </g>
      )}
    </g>
  );
}
