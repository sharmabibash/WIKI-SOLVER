/**
 * Graph data structure manager for Wikipedia BFS Visualizer
 */
export class WikiGraphModel {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, direction, status, level, parent }
    this.links = [];        // [{ source, target, direction, isShortestPath }]
    this.linkSet = new Set(); // to prevent duplicate edges "source->target"
  }

  addNode(id, direction = 'neutral', status = 'frontier', level = 0, parent = null) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        label: id,
        direction,
        status,
        level,
        parent,
        x: undefined,
        y: undefined
      });
    } else {
      const existing = this.nodes.get(id);
      // Update status or direction if needed
      if (status) existing.status = status;
      if (direction && existing.direction === 'neutral') existing.direction = direction;
    }
    return this.nodes.get(id);
  }

  addEdge(source, target, direction = 'forward', isShortestPath = false) {
    const key = `${source}->${target}`;
    if (!this.linkSet.has(key)) {
      this.linkSet.add(key);
      this.links.push({
        id: key,
        source,
        target,
        direction,
        isShortestPath
      });
    }
  }

  markShortestPath(pathNodes) {
    const pathSet = new Set(pathNodes);
    // Mark nodes
    for (const id of pathNodes) {
      if (this.nodes.has(id)) {
        this.nodes.get(id).isShortestPath = true;
      }
    }

    // Mark edges between consecutive path nodes
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i];
      const v = pathNodes[i + 1];
      const edge = this.links.find(e => 
        (e.source === u || (typeof e.source === 'object' && e.source.id === u)) &&
        (e.target === v || (typeof e.target === 'object' && e.target.id === v))
      );
      if (edge) {
        edge.isShortestPath = true;
      } else {
        // Edge might not exist in graph yet if it was discovered in reverse, so add it
        this.addEdge(u, v, 'forward', true);
      }
    }
  }

  toD3Format() {
    return {
      nodes: Array.from(this.nodes.values()),
      links: this.links.map(l => ({ ...l }))
    };
  }

  clear() {
    this.nodes.clear();
    this.links = [];
    this.linkSet.clear();
  }
}
