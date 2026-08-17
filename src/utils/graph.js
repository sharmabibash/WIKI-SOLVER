/**
 * Color and styling constants for graph visualizer
 */
export const GRAPH_COLORS = {
  START: '#06b6d4',       // Cyan
  TARGET: '#f43f5e',      // Rose Pink
  FORWARD_EXPLORED: '#0ea5e9', // Sky blue
  FORWARD_FRONTIER: '#38bdf8', // Bright cyan
  BACKWARD_EXPLORED: '#a855f7', // Purple
  BACKWARD_FRONTIER: '#c084fc', // Bright purple
  COLLISION: '#eab308',   // Bright Gold
  SHORTEST_PATH_NODE: '#10b981', // Emerald
  SHORTEST_PATH_EDGE: '#34d399', // Mint emerald
  DEFAULT_NODE: '#475569',
  DEFAULT_EDGE: 'rgba(100, 116, 139, 0.25)'
};

/**
 * Determines node styling based on state
 */
export function getNodeVisualAttributes(node, isPathNode, isStart, isTarget, isCollision) {
  if (isCollision) {
    return {
      fill: '#eab308',
      stroke: '#fef08a',
      radius: 12,
      glow: 'rgba(250, 204, 21, 0.8)',
      labelColor: '#fef08a',
      badge: 'INTERSECTION'
    };
  }
  if (isStart) {
    return {
      fill: '#06b6d4',
      stroke: '#67e8f9',
      radius: 13,
      glow: 'rgba(6, 182, 212, 0.8)',
      labelColor: '#67e8f9',
      badge: 'START'
    };
  }
  if (isTarget) {
    return {
      fill: '#f43f5e',
      stroke: '#fda4af',
      radius: 13,
      glow: 'rgba(244, 63, 94, 0.8)',
      labelColor: '#fda4af',
      badge: 'TARGET'
    };
  }
  if (isPathNode) {
    return {
      fill: '#10b981',
      stroke: '#6ee7b7',
      radius: 10,
      glow: 'rgba(16, 185, 129, 0.7)',
      labelColor: '#a7f3d0',
      badge: 'PATH'
    };
  }
  if (node.direction === 'forward') {
    return {
      fill: node.status === 'frontier' ? '#38bdf8' : '#0369a1',
      stroke: '#bae6fd',
      radius: node.status === 'frontier' ? 8 : 6,
      glow: 'rgba(56, 189, 248, 0.4)',
      labelColor: '#e0f2fe',
      badge: null
    };
  }
  if (node.direction === 'backward') {
    return {
      fill: node.status === 'frontier' ? '#c084fc' : '#7e22ce',
      stroke: '#f3e8ff',
      radius: node.status === 'frontier' ? 8 : 6,
      glow: 'rgba(192, 132, 252, 0.4)',
      labelColor: '#fae8ff',
      badge: null
    };
  }
  return {
    fill: '#334155',
    stroke: '#64748b',
    radius: 5,
    glow: null,
    labelColor: '#94a3b8',
    badge: null
  };
}

/**
 * Reconstructs the complete path given intersection node, forward parents, and backward parents
 */
export function reconstructBidirectionalPath(intersection, forwardParents, backwardParents) {
  if (!intersection) return [];

  // 1. Trace back forward path from intersection to start
  const forwardPath = [];
  let curr = intersection;
  while (curr) {
    forwardPath.unshift(curr);
    curr = forwardParents[curr];
  }

  // 2. Trace forward backward path from intersection's successor to target
  const backwardPath = [];
  curr = backwardParents[intersection];
  while (curr) {
    backwardPath.push(curr);
    curr = backwardParents[curr];
  }

  return [...forwardPath, ...backwardPath];
}
